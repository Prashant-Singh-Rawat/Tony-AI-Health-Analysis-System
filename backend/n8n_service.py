"""
n8n Webhook Integration Service
Triggers n8n workflows after every health report analysis.

Supported Workflows:
  1. High Risk Alert  → Sends email/SMS/Telegram when risk_score >= 70
  2. Report Saved     → Logs every report to Google Sheets / Notion
  3. Doctor Alert     → Notifies a doctor when critical flags are detected
"""

import httpx
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Environment Variables ──────────────────────────────────────────────────────
N8N_BASE_URL = os.getenv("N8N_BASE_URL", "http://localhost:5678")
N8N_HIGH_RISK_WEBHOOK  = os.getenv("N8N_HIGH_RISK_WEBHOOK",  f"{N8N_BASE_URL}/webhook/heart-ai/high-risk-alert")
N8N_REPORT_SAVED_WEBHOOK = os.getenv("N8N_REPORT_SAVED_WEBHOOK", f"{N8N_BASE_URL}/webhook/heart-ai/report-saved")
N8N_DOCTOR_ALERT_WEBHOOK = os.getenv("N8N_DOCTOR_ALERT_WEBHOOK", f"{N8N_BASE_URL}/webhook/heart-ai/doctor-alert")

HIGH_RISK_THRESHOLD = float(os.getenv("HIGH_RISK_THRESHOLD", "70.0"))
CRITICAL_RISK_THRESHOLD = float(os.getenv("CRITICAL_RISK_THRESHOLD", "85.0"))


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


# ── Public API ─────────────────────────────────────────────────────────────────
async def trigger_report_saved(report_data: dict):
    """
    Trigger the 'Report Saved' workflow in n8n.
    Fires for every new report — logs it to Google Sheets / Notion / DB.
    """
    payload = {
        "event": "report_saved",
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


async def trigger_high_risk_alert(report_data: dict):
    """
    Trigger the 'High Risk Alert' workflow in n8n.
    Only fires when risk_score >= HIGH_RISK_THRESHOLD (default 70).
    n8n then sends Email + Telegram notification.
    """
    risk_score = float(report_data.get("risk_score", 0.0))
    if risk_score < HIGH_RISK_THRESHOLD:
        return  # Not high risk — skip

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


async def trigger_doctor_alert(report_data: dict, doctor_email: Optional[str] = None):
    """
    Trigger the 'Doctor Alert' workflow in n8n.
    Fires when risk_score >= CRITICAL_RISK_THRESHOLD (default 85).
    n8n then emails a doctor with the full report summary.
    """
    risk_score = float(report_data.get("risk_score", 0.0))
    if risk_score < CRITICAL_RISK_THRESHOLD:
        return  # Not critical — skip

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
        "doctor_email":       doctor_email or os.getenv("DOCTOR_EMAIL", "doctor@hospital.com"),
    }
    await _post_webhook(N8N_DOCTOR_ALERT_WEBHOOK, payload)


async def process_report_webhooks(report_data: dict):
    """
    Master function — call this after every report is saved.
    Automatically fires the correct webhooks based on risk score.
    """
    # Always log the report
    await trigger_report_saved(report_data)

    # Fire risk-based alerts
    await trigger_high_risk_alert(report_data)
    await trigger_doctor_alert(report_data)
