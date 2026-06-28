from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    google_id = Column(String, unique=True, index=True, nullable=True) # For Gmail verification
    hashed_password = Column(String, nullable=True) # For email/password authentication
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="owner")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Store the actual text extracted from the PDF or the filename
    pdf_filename = Column(String, nullable=True)
    extracted_text = Column(Text, nullable=True)
    
    # AI Analysis Results
    disease_type = Column(String) # e.g., "Heart", "Obesity"
    risk_score = Column(Float)    # e.g., 0-100%
    concerns = Column(Text)
    exercise_plan = Column(Text)
    food_plan = Column(Text)
    overall_status = Column(String) # e.g., "High Risk", "Improving", "Worsening"

    owner = relationship("User", back_populates="reports")
