from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import n8n_service
import logging
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from datetime import datetime, timedelta
import config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=schemas.UserWithToken)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Trigger welcome email workflow (non-blocking)
    try:
        import asyncio
        asyncio.create_task(n8n_service.trigger_user_registered({
            "id": new_user.id, "name": new_user.name,
            "email": new_user.email, "created_at": new_user.created_at,
            "google_id": new_user.google_id
        }))
    except Exception as e:
        logger.warning(f"[n8n] user-registered webhook skipped: {e}")

    token = create_access_token(data={"sub": new_user.email})
    return schemas.UserWithToken(
        id=new_user.id, email=new_user.email, name=new_user.name, 
        created_at=new_user.created_at, token=token
    )

@router.post("/login", response_model=schemas.UserWithToken)
def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not db_user.hashed_password:
        raise HTTPException(status_code=400, detail="Please sign in with Google for this account")
        
    if not verify_password(credentials.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token = create_access_token(data={"sub": db_user.email})
    return schemas.UserWithToken(
        id=db_user.id, email=db_user.email, name=db_user.name, 
        created_at=db_user.created_at, token=token
    )

@router.post("/google", response_model=schemas.UserWithToken)
def verify_google_token(auth: schemas.GoogleAuth, db: Session = Depends(get_db)):
    try:
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
            
        token = create_access_token(data={"sub": db_user.email})
        return schemas.UserWithToken(
            id=db_user.id, email=db_user.email, name=db_user.name, 
            created_at=db_user.created_at, token=token
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
