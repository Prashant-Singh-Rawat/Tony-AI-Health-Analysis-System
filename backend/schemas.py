from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    disease_type: str
    risk_score: float
    concerns: str
    exercise_plan: str
    food_plan: str
    overall_status: str

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
