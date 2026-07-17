from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON, Boolean
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Enforced in application layer
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    # Store the actual text extracted from the PDF or the filename
    pdf_filename = Column(String, nullable=True)
    extracted_text = Column(Text, nullable=True)

    # Patient Demographics (extracted by AI from the report)
    patient_name = Column(String, nullable=True)
    patient_age = Column(String, nullable=True)
    
    # AI Analysis Results
    disease_type = Column(String)    # e.g., "General Health", "Diabetes", "Cardiac"
    risk_score = Column(Float)       # e.g., 0-100
    concerns = Column(Text)
    exercise_plan = Column(Text)
    food_plan = Column(Text)
    overall_status = Column(String)  # e.g., "High Risk", "Improving", "Worsening"

    # Dynamic fields - work for ANY report type (blood test, discharge summary, etc.)
    extracted_parameters = Column(JSON, nullable=True)  # List of parameter dicts
    potential_diseases = Column(JSON, nullable=True)    # List of disease strings
    doctor_questions = Column(JSON, nullable=True)      # List of questions
    next_steps = Column(JSON, nullable=True)            # List of action items

    owner = relationship("User", back_populates="reports")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    status = Column(String, default="pending") # pending, cloning, indexing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="repository", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"))
    file_path = Column(String, index=True)
    content = Column(Text)

    repository = relationship("Repository", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    chunk_text = Column(Text)
    embedding = Column(JSON, nullable=True) # Storing vector array as JSON for now

    document = relationship("Document", back_populates="chunks")
