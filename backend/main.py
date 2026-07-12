import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, reports, hospitals, medicines

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tony Health Analysis API")

# Setup CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register sub-routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(hospitals.router)
app.include_router(medicines.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Tony Health Analysis API"}