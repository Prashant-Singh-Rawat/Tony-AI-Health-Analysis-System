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

# Auto-migrate table to add new columns if they do not exist
from sqlalchemy import inspect, text
import os
try:
    inspector = inspect(engine)
    if "reports" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("reports")]
        with engine.begin() as conn:
            if "doctor_questions" not in columns:
                conn.execute(text("ALTER TABLE reports ADD COLUMN doctor_questions TEXT"))
                logger.info("Added doctor_questions column to reports table")
            if "next_steps" not in columns:
                conn.execute(text("ALTER TABLE reports ADD COLUMN next_steps TEXT"))
                logger.info("Added next_steps column to reports table")
except Exception as migration_err:
    logger.warning(f"Database schema auto-migration check failed: {migration_err}")

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

# Global exception handler middleware to prevent server crashes
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"[GlobalError] Unhandled exception occurred: {e}", exc_info=True)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again later."}
        )

# Register sub-routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(hospitals.router)
app.include_router(medicines.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Tony Health Analysis API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
