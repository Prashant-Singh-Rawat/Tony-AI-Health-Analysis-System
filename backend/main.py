from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from database import Base
import models
import schemas
import ai_service

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tony Health Analysis API")

# Setup CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel

class GoogleAuth(BaseModel):
    token: str

@app.post("/auth/google", response_model=schemas.User)
def verify_google_token(auth: GoogleAuth, db: Session = Depends(get_db)):
    try:
        # In production, specify the CLIENT_ID: id_token.verify_oauth2_token(auth.token, requests.Request(), CLIENT_ID)
        # For now, we will decode it without verification or with generic verification since CLIENT_ID is not provided yet.
        idinfo = id_token.verify_oauth2_token(auth.token, requests.Request())
        
        email = idinfo['email']
        name = idinfo.get('name', 'Patient')
        google_id = idinfo['sub']

        db_user = db.query(models.User).filter(models.User.email == email).first()
        if not db_user:
            db_user = models.User(email=email, name=name, google_id=google_id)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")

@app.get("/users/{user_id}/reports", response_model=list[schemas.Report])
def get_user_reports(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user.reports

@app.post("/users/{user_id}/reports", response_model=schemas.Report)
def create_report(user_id: int, report: schemas.ReportCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_report = models.Report(**report.dict(), user_id=user_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.post("/users/{user_id}/upload_report", response_model=schemas.Report)
async def upload_and_analyze_report(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Extract text
    file_bytes = await file.read()
    try:
        extracted_text = ai_service.extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse PDF: {str(e)}")
        
    # Analyze with Gemini
    try:
        # Check if user has historical reports for trend analysis
        historical_reports_db = db.query(models.Report).filter(models.Report.user_id == user_id).order_by(models.Report.timestamp.asc()).all()
        
        if len(historical_reports_db) > 0:
            # Longitudinal Analysis
            historical_texts = [r.extracted_text for r in historical_reports_db if r.extracted_text]
            ai_result = ai_service.analyze_trend_with_gemini(historical_texts, extracted_text)
        else:
            # Single-Session Analysis
            ai_result = ai_service.analyze_report_with_gemini(extracted_text)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")
        
    # Save the report
    db_report = models.Report(
        user_id=user_id,
        pdf_filename=file.filename,
        extracted_text=extracted_text,
        disease_type=ai_result.get("disease_type", "Unknown"),
        risk_score=ai_result.get("risk_score", 0.0),
        concerns=ai_result.get("concerns", ""),
        exercise_plan=ai_result.get("exercise_plan", ""),
        food_plan=ai_result.get("food_plan", ""),
        overall_status=ai_result.get("overall_status", "Pending")
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.get("/")
def read_root():
    return {"message": "Welcome to Tony Health Analysis API"}
