from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request())
        email = idinfo['email']
        db_user = db.query(models.User).filter(models.User.email == email).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found in database")
        return db_user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
