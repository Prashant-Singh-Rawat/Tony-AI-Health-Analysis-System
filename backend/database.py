import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import config

DATABASE_URL = config.DATABASE_URL

# Render's PostgreSQL URLs start with "postgres://" but SQLAlchemy 1.4+
# requires "postgresql://" — fix it automatically.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False; PostgreSQL does not
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
