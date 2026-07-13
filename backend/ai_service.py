"""
AI Medical Report Analysis Service
===================================
Uses Google Gemini to structure and analyze medical report text.
Supports any report type: CBC, LFT, KFT, Lipid, Thyroid, Urine, etc.
"""
import os
import json
import logging
import re
from typing import Optional

from google import genai
from google.genai import types
import config
from pdf_extractor import run_extraction_pipeline

logger = logging.getLogger(__name__)

# ─── Gemini Client Setup ──────────────────────────────────────────────────────
_gemini_api_key = config.HEALTH_AI_API
client = None

if _gemini_api_key:
    try:
        client = genai.Client(api_key=_gemini_api_key)
        logger.info("[AI] Gemini client initialized successfully.")
    except Exception as e:
        logger.error(f"[AI] Failed to initialize Gemini client: {e}")
        client = None
else:
    logger.error("[AI] HEALTH_AI_API not set in environment. AI analysis will not work.")

# ─── Model Priority List ──────────────────────────────────────────────────────
# Only Flash models — they share quota and have the highest free tier RPD (20/day).
# gemini-pro-latest is intentionally excluded: it has a LOWER free tier quota
# (separate RPD pool) and resolves to gemini-3.1-pro which exhausts faster.
MODELS_TO_TRY = ["models/gemini-2.5-flash", "models/gemini-2.0-flash"]


# ─── System Prompt ────────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION = """You are an expert AI medical analyst and biomarker interpretation engine.

YOUR ONLY JOB: Read the medical report text provided and return a single, complete JSON object.

=== ABSOLUTE RULES — NEVER BREAK ===
1. NEVER invent, hallucinate, or guess any information not explicitly in the report text.
2. Return ONLY raw JSON — no markdown fences (```json```), no explanations, no comments.
3. If a field cannot be determined, return null (not "Not Found", not "Unknown", not "N/A").
4. patient_name MUST come from the VERIFIED PATIENT NAME field — do NOT change it.
5. patient_age MUST come from the VERIFIED AGE field — do NOT change it.

=== PARAMETER EXTRACTION RULES ===
- Extract EVERY lab test, measurement, or clinical value present in the text.
- Include values even if reference ranges are not stated in the report — use standard medical reference ranges.
- Accept any format: tables, lists, inline text, abbreviations (Hb, WBC, PLT, TSH, LDL, etc.)
- For each parameter, determine status using the reference interval:
  * "normal" → within reference range
  * "high" → above upper reference limit
  * "low" → below lower reference limit
  * "abnormal" → qualitative abnormal (e.g., Positive, Reactive, Trace)
- If a numeric value is given without a reference range, use standard clinical reference ranges.

=== RISK SCORE RULES ===
- risk_score is a float 0-100 calculated as follows:
  * Start at 0
  * Each abnormal/high/low parameter: +10 to +20 depending on clinical significance
  * Critical values (e.g., Hb < 7, Glucose > 400, K+ > 6.5): +25 each
  * Cap at 100
  * If ALL parameters are normal: risk_score = max(5, 10)
  * Never return 0 if any parameter was extracted (even all-normal = at least 5)

=== REQUIRED JSON SCHEMA ===
{
  "patient_name": "string or null",
  "patient_age": "string or null",
  "gender": "string or null",
  "hospital": "string or null",
  "doctor": "string or null",
  "report_date": "string or null",
  "disease_type": "concise label: e.g. 'Complete Blood Count', 'Lipid Profile', 'Thyroid Function', 'Liver Function', 'Kidney Function', 'Urine Analysis', 'Comprehensive Metabolic Panel', 'Diabetes Panel'",
  "risk_score": <float 0-100>,
  "overall_status": "exactly one of: 'High Risk', 'Moderate Risk', 'Low Risk', 'Improving', 'Worsening'",
  "extracted_parameters": [
    {
      "name": "exact parameter name",
      "value": "value as string",
      "unit": "unit or empty string",
      "reference_interval": "reference range as 'low-high' or descriptive string",
      "status": "normal | high | low | abnormal"
    }
  ],
  "potential_diseases": ["list of conditions patient may be at risk for based on findings"],
  "concerns": "A clear, specific clinical paragraph describing what is abnormal and why it matters. Reference actual parameter names and values. If all values are normal, write a positive summary.",
  "exercise_plan": "Specific, actionable exercise recommendations based on the findings. Include frequency, type, and duration.",
  "food_plan": "Specific dietary recommendations addressing the abnormal findings. Include foods to eat and avoid.",
  "doctor_questions": ["List of 4-6 specific questions the patient should ask their doctor based on findings"],
  "next_steps": ["List of 3-5 specific action items the patient should take within the next 30 days"]
}
"""


# ─── Helper: Safe JSON Extraction ────────────────────────────────────────────

def _extract_json(raw: str) -> dict:
    """Strip all markdown fences and extract the first valid JSON object."""
    text = raw.strip()

    # Remove all common code fence variations
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```\s*$', '', text)
    text = text.strip()

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try finding JSON object with brace matching
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from AI response. First 300 chars: {text[:300]}")


# ─── Helper: Error Classification ────────────────────────────────────────────

def _is_quota_error(e: Exception) -> bool:
    """Return True if the exception is a rate-limit / quota exhaustion error."""
    msg = str(e)
    return "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower()

def _is_auth_error(e: Exception) -> bool:
    """Return True if the exception is an authentication / invalid key error."""
    msg = str(e)
    return "API_KEY_INVALID" in msg or "403" in msg or "PERMISSION_DENIED" in msg

# ─── Helper: Try Gemini with Model Fallback ──────────────────────────────────

def _call_gemini(contents: list, system_instruction: str = SYSTEM_INSTRUCTION) -> str:
    """
    Try each model in MODELS_TO_TRY, return the text of the first successful response.

    Retry rules:
    - Transient server errors (500, 503, network): retry up to 3 times with backoff.
    - Quota exhaustion (429): do NOT retry — fail immediately with a clear message.
      All models share the same API key quota, so trying other models is futile.
    - Auth errors (403/API_KEY_INVALID): do NOT retry — fail immediately.
    """
    if not client:
        raise RuntimeError(
            "Gemini client is not initialized. Check HEALTH_AI_API in .env — "
            "get a valid key from https://aistudio.google.com/apikey"
        )

    import time
    last_error = None

    for model_name in MODELS_TO_TRY:
        for attempt in range(1, 4):
            try:
                logger.info(f"[AI] Attempting model: {model_name} (attempt {attempt}/3)")
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.05,
                    )
                )
                logger.info(f"[AI] Model {model_name} responded successfully.")
                return response.text

            except Exception as e:
                last_error = e
                err_str = str(e)

                # ── Quota exhaustion: stop everything immediately ──────────────
                if _is_quota_error(e):
                    logger.error(
                        f"[AI] Quota exhausted on model {model_name}: {err_str}. "
                        "Not retrying — all models share the same API key quota."
                    )
                    raise RuntimeError(
                        f"429 RESOURCE_EXHAUSTED — AI quota exceeded. "
                        "Please wait a minute before retrying, or check your Gemini API billing."
                    )

                # ── Auth error: stop everything immediately ───────────────────
                if _is_auth_error(e):
                    logger.error(f"[AI] Authentication error on model {model_name}: {err_str}.")
                    raise RuntimeError(
                        "API_KEY_INVALID — Gemini API key rejected. "
                        "Please verify HEALTH_AI_API is a valid key from https://aistudio.google.com/apikey"
                    )

                # ── Transient error: retry with backoff ───────────────────────
                logger.warning(
                    f"[AI] Model {model_name} attempt {attempt}/3 failed (transient): {err_str}"
                )
                if attempt < 3:
                    time.sleep(attempt)  # 1s then 2s
                # continue to next attempt

        # All 3 attempts for this model exhausted, try next model

    raise RuntimeError(f"All Gemini models failed after retries. Last error: {last_error}")





# ─── Main AI Analysis ─────────────────────────────────────────────────────────

def analyze_with_ai(
    extracted_text: str,
    patient_fields: dict,
    pdf_bytes: Optional[bytes] = None,
    is_scanned: bool = False,
) -> dict:
    """
    Send extracted text + verified patient fields to Gemini.
    Patient data from regex extraction is passed as VERIFIED GROUND TRUTH.
    Logs extensively so you can trace exactly what was sent and received.
    """
    # ── Pre-flight validation ─────────────────────────────────────────────────
    if not extracted_text or len(extracted_text.strip()) < 30:
        raise ValueError(
            "Extracted text is too short to analyze. "
            "The PDF may be empty, image-only (scanned), or corrupted. "
            "Please upload a clear, readable PDF with medical data."
        )

    pf = patient_fields or {}
    verified_block = f"""VERIFIED PATIENT INFORMATION (extracted by regex — DO NOT CHANGE THESE):
- VERIFIED PATIENT NAME: {pf.get('patient_name', {}).get('value', 'Not Found')}
- VERIFIED AGE: {pf.get('age', {}).get('value', 'Not Found')}
- VERIFIED GENDER: {pf.get('gender', {}).get('value', 'Not Found')}
- VERIFIED DOB: {pf.get('dob', {}).get('value', 'Not Found')}
- VERIFIED HOSPITAL: {pf.get('hospital', {}).get('value', 'Not Found')}
- VERIFIED DOCTOR: {pf.get('doctor', {}).get('value', 'Not Found')}
- VERIFIED REPORT DATE: {pf.get('report_date', {}).get('value', 'Not Found')}
- VERIFIED BLOOD GROUP: {pf.get('blood_group', {}).get('value', 'Not Found')}

MEDICAL REPORT TEXT (analyze ALL lab values found below):
===BEGIN REPORT===
{extracted_text[:10000]}
===END REPORT===

IMPORTANT: Extract every lab test value you see. Do NOT skip parameters.
Calculate risk_score based on how many values are abnormal and how severely.
Return ONLY the JSON object — no markdown, no explanation.
"""

    logger.info(f"[AI] Preparing request — text length: {len(extracted_text)} chars")
    logger.info(f"[AI] Sample text (first 400 chars):\n{extracted_text[:400]}")

    contents = [verified_block]

    # For scanned PDFs, attach page images for vision analysis
    if is_scanned and pdf_bytes:
        try:
            from pdf2image import convert_from_bytes
            import config as cfg
            logger.info("[AI] Scanned PDF detected — attaching images for vision analysis")
            images = convert_from_bytes(pdf_bytes, dpi=180, poppler_path=cfg.POPPLER_PATH)
            contents.insert(0, "These are scanned pages of a medical report. Extract ALL lab values visible:")
            for img in images[:5]:
                contents.append(img)
            logger.info(f"[AI] Attached {min(len(images), 5)} page images for vision")
        except Exception as e:
            logger.warning(f"[AI] Could not attach PDF images for vision (likely missing poppler): {e}")
            logger.info("[AI] Attaching raw PDF document directly for Gemini vision analysis...")
            contents.insert(0, "This is a scanned medical report PDF. Extract ALL lab values visible:")
            pdf_part = types.Part.from_bytes(
                data=pdf_bytes,
                mime_type="application/pdf"
            )
            contents.append(pdf_part)


    # ── Call Gemini ───────────────────────────────────────────────────────────
    raw_response = _call_gemini(contents)

    logger.info(f"[AI] Raw response length: {len(raw_response)} chars")
    logger.info(f"[AI] Raw response preview:\n{raw_response[:600]}")

    # ── Parse JSON ────────────────────────────────────────────────────────────
    try:
        result = _extract_json(raw_response)
    except (ValueError, Exception) as e:
        logger.error(f"[AI] JSON parse failed: {e}")
        logger.error(f"[AI] Full raw response:\n{raw_response}")
        raise RuntimeError(f"AI returned unparseable response: {e}")

    # ── Log extracted parameters ──────────────────────────────────────────────
    params = result.get("extracted_parameters", [])
    logger.info(f"[AI] Parameters extracted: {len(params)}")
    for p in params:
        logger.info(f"  • {p.get('name')} = {p.get('value')} {p.get('unit')} [{p.get('status')}]")

    logger.info(f"[AI] risk_score={result.get('risk_score')} | overall_status={result.get('overall_status')}")
    logger.info(f"[AI] disease_type={result.get('disease_type')}")

    # ── Safety Override: Force regex-extracted patient data ───────────────────
    verified_name = pf.get('patient_name', {}).get('value')
    verified_age = pf.get('age', {}).get('value')
    verified_gender = pf.get('gender', {}).get('value')

    if verified_name and verified_name not in ("Not Found", "N/A", "", None):
        result['patient_name'] = verified_name
    if verified_age and verified_age not in ("Not Found", "N/A", "", None):
        result['patient_age'] = verified_age
    if verified_gender and verified_gender not in ("Not Found", "N/A", "", None):
        result['gender'] = verified_gender

    # Normalize "Not Found" → null
    for field in ('patient_name', 'patient_age', 'gender', 'hospital', 'doctor', 'report_date'):
        val = result.get(field)
        if val in ("Not Found", "N/A", "null", "None", ""):
            result[field] = None

    # Ensure numeric risk_score
    try:
        result['risk_score'] = float(result.get('risk_score') or 0.0)
    except (TypeError, ValueError):
        result['risk_score'] = 0.0

    # Ensure lists are lists
    if not isinstance(result.get('extracted_parameters'), list):
        result['extracted_parameters'] = []
    if not isinstance(result.get('potential_diseases'), list):
        result['potential_diseases'] = []
    if not isinstance(result.get('doctor_questions'), list):
        result['doctor_questions'] = []
    if not isinstance(result.get('next_steps'), list):
        result['next_steps'] = []

    # If risk_score is 0 but parameters were extracted, set a minimum
    if result['risk_score'] == 0 and len(result['extracted_parameters']) > 0:
        abnormal = sum(1 for p in result['extracted_parameters'] if p.get('status') != 'normal')
        result['risk_score'] = max(5.0, abnormal * 12.0)
        logger.info(f"[AI] Adjusted risk_score from 0 to {result['risk_score']} based on {abnormal} abnormal params")

    return result


# ─── Trend Analysis ───────────────────────────────────────────────────────────

def analyze_trend_with_gemini(historical_reports: list, latest_report: str) -> dict:
    """Compare latest report against historical ones for trend analysis."""
    prompt = "Patient's historical report summaries (oldest to newest):\n"
    for i, report in enumerate(historical_reports[-5:]):  # Last 5 reports max
        prompt += f"\nReport {i + 1}:\n{report[:1500]}\n"
    prompt += f"\nLATEST REPORT:\n{latest_report[:5000]}\n\n"
    prompt += (
        "Compare the latest report to history. "
        "Determine if the patient's health is Improving or Worsening. "
        "Return the complete analysis JSON. Do NOT invent patient data."
    )

    raw = _call_gemini([prompt])
    return _extract_json(raw)


# ─── Legacy Compatibility Shims ───────────────────────────────────────────────

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    result = run_extraction_pipeline(pdf_bytes)
    return result["text"]


def analyze_report_with_gemini(extracted_text: str, pdf_bytes: bytes = None) -> dict:
    if pdf_bytes:
        pipeline = run_extraction_pipeline(pdf_bytes)
    else:
        from pdf_extractor import clean_text, extract_patient_fields as _epf
        clean = clean_text(extracted_text)
        pd = _epf(clean)
        pipeline = {
            "text": clean,
            "engine_used": "text_only",
            "is_scanned": False,
            "patient_fields": pd["fields"],
        }

    best_text = pipeline["text"] if pipeline["text"] else extracted_text
    return analyze_with_ai(
        extracted_text=best_text,
        patient_fields=pipeline["patient_fields"],
        pdf_bytes=pdf_bytes if pipeline["is_scanned"] else None,
        is_scanned=pipeline["is_scanned"],
    )
