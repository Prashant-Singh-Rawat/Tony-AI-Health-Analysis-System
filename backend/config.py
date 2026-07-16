import os
from dotenv import load_dotenv

load_dotenv()

# App settings
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./tonyhealth.db")

# JWT Authentication
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-development-only")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

# Gemini settings
HEALTH_AI_API = os.getenv("HEALTH_AI_API")
POPPLER_PATH = os.getenv("POPPLER_PATH", None)

# n8n Webhook settings
N8N_BASE_URL = os.getenv("N8N_BASE_URL", "http://localhost:5678")
N8N_HIGH_RISK_WEBHOOK = os.getenv("N8N_HIGH_RISK_WEBHOOK", f"{N8N_BASE_URL}/webhook/heart-ai/high-risk-alert")
N8N_REPORT_SAVED_WEBHOOK = os.getenv("N8N_REPORT_SAVED_WEBHOOK", f"{N8N_BASE_URL}/webhook/heart-ai/report-saved")
N8N_DOCTOR_ALERT_WEBHOOK = os.getenv("N8N_DOCTOR_ALERT_WEBHOOK", f"{N8N_BASE_URL}/webhook/heart-ai/doctor-alert")

# New workflow webhooks
N8N_USER_REGISTERED_WEBHOOK   = os.getenv("N8N_USER_REGISTERED_WEBHOOK",   f"{N8N_BASE_URL}/webhook/heart-ai/user-registered")
N8N_MEDICINE_REMINDER_WEBHOOK = os.getenv("N8N_MEDICINE_REMINDER_WEBHOOK", f"{N8N_BASE_URL}/webhook/heart-ai/medicine-reminder")
N8N_WORKOUT_REMINDER_WEBHOOK  = os.getenv("N8N_WORKOUT_REMINDER_WEBHOOK",  f"{N8N_BASE_URL}/webhook/heart-ai/workout-reminder")
N8N_DIET_REMINDER_WEBHOOK     = os.getenv("N8N_DIET_REMINDER_WEBHOOK",     f"{N8N_BASE_URL}/webhook/heart-ai/diet-reminder")
N8N_WEEKLY_SUMMARY_WEBHOOK    = os.getenv("N8N_WEEKLY_SUMMARY_WEBHOOK",    f"{N8N_BASE_URL}/webhook/heart-ai/weekly-summary")
N8N_APPOINTMENT_WEBHOOK       = os.getenv("N8N_APPOINTMENT_WEBHOOK",       f"{N8N_BASE_URL}/webhook/heart-ai/appointment-reminder")
N8N_EMERGENCY_ALERT_WEBHOOK   = os.getenv("N8N_EMERGENCY_ALERT_WEBHOOK",   f"{N8N_BASE_URL}/webhook/heart-ai/emergency-alert")

HIGH_RISK_THRESHOLD = float(os.getenv("HIGH_RISK_THRESHOLD", "70.0"))
CRITICAL_RISK_THRESHOLD = float(os.getenv("CRITICAL_RISK_THRESHOLD", "85.0"))
DOCTOR_EMAIL = os.getenv("DOCTOR_EMAIL", "doctor@hospital.com")
