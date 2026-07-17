import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, reports, hospitals, medicines, repositories

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the database tables
models.Base.metadata.create_all(bind=engine)

# Auto-migrate table to add new columns if they do not exist
from sqlalchemy import inspect, text
import os

try:
    with engine.begin() as conn:
        columns_to_add = [
            "is_deleted BOOLEAN DEFAULT FALSE",
            "pdf_filename VARCHAR",
            "extracted_text TEXT",
            "patient_name VARCHAR",
            "patient_age VARCHAR",
            "extracted_parameters JSON",
            "potential_diseases JSON",
            "doctor_questions TEXT",
            "next_steps TEXT"
        ]
        for col_def in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE reports ADD COLUMN {col_def}"))
            except Exception as e:
                if "duplicate column name" not in str(e).lower():
                    logger.warning(f"Reports migration warning for {col_def}: {e}")
        logger.info("Migrated reports table")
except Exception as e:
    logger.warning(f"Reports migration failed: {e}")

try:
    with engine.begin() as conn:
        columns_to_add = [
            "google_id VARCHAR",
            "hashed_password VARCHAR"
        ]
        for col_def in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_def}"))
            except Exception as e:
                if "duplicate column name" not in str(e).lower():
                    logger.warning(f"Users migration warning for {col_def}: {e}")
        logger.info("Migrated users table")
except Exception as e:
    logger.warning(f"Users migration failed: {e}")

app = FastAPI(title="Tony Health Analysis API")

# Setup CORS for the React Frontend
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://prashant-singh-rawat.github.io",
]
origins_env = os.environ.get("ALLOWED_ORIGINS")
if origins_env:
    allowed_origins.extend([o.strip() for o in origins_env.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"[GlobalError] Unhandled exception occurred: {exc}", exc_info=True)
    
    # Manually append CORS headers to the 500 response
    origin = request.headers.get("origin")
    headers = {}
    if origin in allowed_origins:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal server error occurred: {str(exc)}"},
        headers=headers
    )

# Register sub-routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(hospitals.router)
app.include_router(medicines.router)
app.include_router(repositories.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Tony Health Analysis API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
