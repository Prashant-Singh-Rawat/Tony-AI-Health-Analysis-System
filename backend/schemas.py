from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GoogleAuth(BaseModel):
    token: str

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    google_id: str

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    pdf_filename: Optional[str] = None
    extracted_text: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[str] = None
    disease_type: Optional[str] = None
    risk_score: Optional[float] = 0.0
    concerns: Optional[str] = None
    exercise_plan: Optional[str] = None
    food_plan: Optional[str] = None
    overall_status: Optional[str] = None
    extracted_parameters: Optional[list] = None
    potential_diseases: Optional[list] = None

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    user_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True
