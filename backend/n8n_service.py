"""
n8n Webhook Integration Service — Extended
Triggers n8n workflows for all lifecycle events in the Tony Health system.

Supported Workflows:
  1.  Report Saved         → Logs every report to Google Sheets
  2.  High Risk Alert      → Email + Telegram when risk_score >= 70
  3.  Doctor Alert         → Notifies a doctor when risk_score >= 85
  4.  User Registered      → Welcome email on new account creation
  5.  Medicine Reminder    → Daily push/email reminder for medications
  6.  Workout Reminder     → Daily exercise nudge based on exercise_plan
  7.  Diet Reminder        → Meal-time reminder based on food_plan
  8.  Weekly Summary       → Every Sunday: aggregated health trend digest
  9.  Appointment Reminder → 24-hour advance notice before doctor visit
  10. Emergency Alert      → Instant SMS/call when risk_score >= 95
"""

import httpx
import logging
from typing import Optional

import config

logger = logging.getLogger(__name__)

# ── Webhook URLs (from config) ─────────────────────────────────────────────────
N8N_BASE_URL              = config.N8N_BASE_URL
N8N_HIGH_RISK_WEBHOOK     = config.N8N_HIGH_RISK_WEBHOOK
N8N_REPORT_SAVED_WEBHOOK  = config.N8N_REPORT_SAVED_WEBHOOK
N8N_DOCTOR_ALERT_WEBHOOK  = config.N8N_DOCTOR_ALERT_WEBHOOK
N8N_USER_REGISTERED_WEBHOOK   = config.N8N_USER_REGISTERED_WEBHOOK
N8N_MEDICINE_REMINDER_WEBHOOK = config.N8N_MEDICINE_REMINDER_WEBHOOK
N8N_WORKOUT_REMINDER_WEBHOOK  = config.N8N_WORKOUT_REMINDER_WEBHOOK
N8N_DIET_REMINDER_WEBHOOK     = config.N8N_DIET_REMINDER_WEBHOOK
N8N_WEEKLY_SUMMARY_WEBHOOK    = config.N8N_WEEKLY_SUMMARY_WEBHOOK
N8N_APPOINTMENT_WEBHOOK       = config.N8N_APPOINTMENT_WEBHOOK
N8N_EMERGENCY_ALERT_WEBHOOK   = config.N8N_EMERGENCY_ALERT_WEBHOOK

HIGH_RISK_THRESHOLD     = config.HIGH_RISK_THRESHOLD
CRITICAL_RISK_THRESHOLD = config.CRITICAL_RISK_THRESHOLD
EMERGENCY_THRESHOLD     = 95.0


# ── Helper ─────────────────────────────────────────────────────────────────────
async def _post_webhook(url: str, payload: dict, timeout: float = 10.0) -> bool:
    """Fire-and-forget POST to an n8n webhook. Returns True on success."""
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            if response.status_code in (200, 201):
                logger.info(f"[n8n] ✅ Webhook fired → {url}")
                return True
            else:
                logger.warning(f"[n8n] ⚠️  Webhook returned {response.status_code} → {url}")
                return False
    except httpx.ConnectError:
        logger.warning(f"[n8n] 🔌 n8n not reachable at {url}. Skipping webhook.")
        return False
    except Exception as exc:
        logger.error(f"[n8n] ❌ Webhook error → {url}: {exc}")
        return False


# ── Workflow 1: Report Saved ───────────────────────────────────────────────────
async def trigger_report_saved(report_data: dict):
    """Fires for every new report. Logs it to Google Sheets / Notion."""
    payload = {
        "event":          "report_saved",
        "report_id":      report_data.get("id"),
        "patient_name":   report_data.get("patient_name", "Unknown"),
        "patient_age":    report_data.get("patient_age"),
        "disease_type":   report_data.get("disease_type", "Unknown"),
        "risk_score":     report_data.get("risk_score", 0.0),
        "overall_status": report_data.get("overall_status", "Low Risk"),
        "timestamp":      str(report_data.get("timestamp", "")),
        "pdf_filename":   report_data.get("pdf_filename", ""),
    }
    await _post_webhook(N8N_REPORT_SAVED_WEBHOOK, payload)


# ── Workflow 2: High Risk Alert ────────────────────────────────────────────────
async def trigger_high_risk_alert(report_data: dict):
    """Fires when risk_score >= HIGH_RISK_THRESHOLD. Sends Email + Telegram."""
    risk_score = float(report_data.get("risk_score", 0.0))
    if risk_score < HIGH_RISK_THRESHOLD:
        return

    payload = {
        "event":          "high_risk_alert",
        "report_id":      report_data.get("id"),
        "patient_name":   report_data.get("patient_name", "Unknown"),
        "patient_age":    report_data.get("patient_age"),
        "risk_score":     risk_score,
        "risk_level":     "CRITICAL" if risk_score >= CRITICAL_RISK_THRESHOLD else "HIGH",
        "disease_type":   report_data.get("disease_type", "Unknown"),
        "overall_status": report_data.get("overall_status"),
        "concerns":       report_data.get("concerns", ""),
        "exercise_plan":  report_data.get("exercise_plan", ""),
        "food_plan":      report_data.get("food_plan", ""),
    }
    await _post_webhook(N8N_HIGH_RISK_WEBHOOK, payload)


# ── Workflow 3: Doctor Alert ───────────────────────────────────────────────────
async def trigger_doctor_alert(report_data: dict, doctor_email: Optional[str] = None):
    """Fires when risk_score >= CRITICAL_RISK_THRESHOLD. Emails the doctor."""
    risk_score = float(report_data.get("risk_score", 0.0))
    if risk_score < CRITICAL_RISK_THRESHOLD:
        return

    payload = {
        "event":              "doctor_alert",
        "report_id":          report_data.get("id"),
        "patient_name":       report_data.get("patient_name", "Unknown"),
        "patient_age":        report_data.get("patient_age"),
        "risk_score":         risk_score,
        "disease_type":       report_data.get("disease_type", "Unknown"),
        "concerns":           report_data.get("concerns", ""),
        "exercise_plan":      report_data.get("exercise_plan", ""),
        "food_plan":          report_data.get("food_plan", ""),
        "potential_diseases": report_data.get("potential_diseases", []),
        "doctor_email":       doctor_email or config.DOCTOR_EMAIL,
    }
    await _post_webhook(N8N_DOCTOR_ALERT_WEBHOOK, payload)


# ── Workflow 4: User Registered ────────────────────────────────────────────────
async def trigger_user_registered(user_data: dict):
    """Fires when a new user account is created. Sends a welcome email."""
    payload = {
        "event":      "user_registered",
        "user_id":    user_data.get("id"),
        "name":       user_data.get("name"),
        "email":      user_data.get("email"),
        "created_at": str(user_data.get("created_at", "")),
        "auth_type":  "google" if user_data.get("google_id") else "email",
    }
    await _post_webhook(N8N_USER_REGISTERED_WEBHOOK, payload)


# ── Workflow 5: Medicine Reminder ──────────────────────────────────────────────
async def trigger_medicine_reminder(user_data: dict, medicine_list: list):
    """Fires daily to remind a patient to take their prescribed medicines."""
    payload = {
        "event":        "medicine_reminder",
        "user_id":      user_data.get("id"),
        "patient_name": user_data.get("name"),
        "email":        user_data.get("email"),
        "medicines":    medicine_list,
    }
    await _post_webhook(N8N_MEDICINE_REMINDER_WEBHOOK, payload)


# ── Workflow 6: Workout Reminder ───────────────────────────────────────────────
async def trigger_workout_reminder(user_data: dict, exercise_plan: str):
    """Fires daily to nudge the patient about their personalized exercise plan."""
    payload = {
        "event":         "workout_reminder",
        "user_id":       user_data.get("id"),
        "patient_name":  user_data.get("name"),
        "email":         user_data.get("email"),
        "exercise_plan": exercise_plan,
    }
    await _post_webhook(N8N_WORKOUT_REMINDER_WEBHOOK, payload)


# ── Workflow 7: Diet Reminder ──────────────────────────────────────────────────
async def trigger_diet_reminder(user_data: dict, food_plan: str):
    """Fires at meal times to remind the patient about their dietary guidance."""
    payload = {
        "event":        "diet_reminder",
        "user_id":      user_data.get("id"),
        "patient_name": user_data.get("name"),
        "email":        user_data.get("email"),
        "food_plan":    food_plan,
    }
    await _post_webhook(N8N_DIET_REMINDER_WEBHOOK, payload)


# ── Workflow 8: Weekly Health Summary ─────────────────────────────────────────
async def trigger_weekly_summary(user_data: dict, summary_data: dict):
    """Fires every Sunday with an aggregated health trend digest."""
    payload = {
        "event":              "weekly_summary",
        "user_id":            user_data.get("id"),
        "patient_name":       user_data.get("name"),
        "email":              user_data.get("email"),
        "week_start":         summary_data.get("week_start"),
        "week_end":           summary_data.get("week_end"),
        "avg_risk_score":     summary_data.get("avg_risk_score"),
        "trend":              summary_data.get("trend", "Stable"),
        "reports_this_week":  summary_data.get("reports_this_week", 0),
        "top_concerns":       summary_data.get("top_concerns", []),
    }
    await _post_webhook(N8N_WEEKLY_SUMMARY_WEBHOOK, payload)


# ── Workflow 9: Doctor Appointment Reminder ────────────────────────────────────
async def trigger_appointment_reminder(user_data: dict, appointment: dict):
    """Fires 24 hours before a scheduled doctor appointment."""
    payload = {
        "event":        "appointment_reminder",
        "user_id":      user_data.get("id"),
        "patient_name": user_data.get("name"),
        "email":        user_data.get("email"),
        "doctor_name":  appointment.get("doctor_name"),
        "specialty":    appointment.get("specialty"),
        "date":         appointment.get("date"),
        "time":         appointment.get("time"),
        "location":     appointment.get("location"),
    }
    await _post_webhook(N8N_APPOINTMENT_WEBHOOK, payload)


# ── Workflow 10: Emergency Alert ───────────────────────────────────────────────
async def trigger_emergency_alert(report_data: dict, emergency_contacts: list):
    """Fires immediately when risk_score >= 95. Triggers SMS/call cascade."""
    risk_score = float(report_data.get("risk_score", 0.0))
    if risk_score < EMERGENCY_THRESHOLD:
        return

    payload = {
        "event":               "emergency_alert",
        "report_id":           report_data.get("id"),
        "patient_name":        report_data.get("patient_name", "Unknown"),
        "patient_age":         report_data.get("patient_age"),
        "risk_score":          risk_score,
        "disease_type":        report_data.get("disease_type"),
        "concerns":            report_data.get("concerns", ""),
        "emergency_contacts":  emergency_contacts,
        "doctor_email":        config.DOCTOR_EMAIL,
    }
    await _post_webhook(N8N_EMERGENCY_ALERT_WEBHOOK, payload)


# ── Master Dispatcher ──────────────────────────────────────────────────────────
async def process_report_webhooks(report_data: dict):
    """
    Master function — call this after every report is saved.
    Automatically fires the correct webhooks based on risk score.
    """
    await trigger_report_saved(report_data)
    await trigger_high_risk_alert(report_data)
    await trigger_doctor_alert(report_data)

    # Emergency alerts for critically dangerous scores
    risk_score = float(report_data.get("risk_score", 0.0))
    if risk_score >= EMERGENCY_THRESHOLD:
        await trigger_emergency_alert(report_data, emergency_contacts=[])
