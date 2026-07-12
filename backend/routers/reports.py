from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import ai_service
import n8n_service
import logging
import re
from deps import get_current_user
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
from pdf_extractor import run_extraction_pipeline

router = APIRouter(tags=["reports"])
logger = logging.getLogger(__name__)

# Minimum extracted text to attempt AI analysis
MIN_TEXT_FOR_ANALYSIS = 50


@router.get("/users/{user_id}/reports", response_model=list[schemas.Report])
def get_user_reports(
    user_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user_id.isdigit():
        return []
    db_user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not db_user or db_user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these reports")
    return db_user.reports


@router.get("/reports", response_model=list[schemas.Report])
def get_all_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Report)
        .filter(models.Report.user_id == current_user.id)
        .order_by(models.Report.timestamp.asc())
        .all()
    )


@router.post("/users/{user_id}/reports", response_model=schemas.Report)
def create_report(
    user_id: int,
    report: schemas.ReportCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create reports for this user")
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_report = models.Report(**report.dict(), user_id=user_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.post("/upload_report", response_model=schemas.Report)
async def upload_and_analyze_report(
    file: UploadFile = File(...),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a medical report PDF, extract text, run AI analysis, and save the result.
    Returns the saved report with all analysis fields populated.
    """
    # ── Read file ─────────────────────────────────────────────────────────────
    file_bytes = await file.read()
    logger.info(f"[Upload] File received: '{file.filename}' | Size: {len(file_bytes)} bytes | ContentType: {file.content_type}")

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty. Please upload a valid PDF medical report."
        )

    # ── Stage 1–3: Extract text from PDF ─────────────────────────────────────
    logger.info("[Upload] Starting multi-engine PDF extraction pipeline...")
    try:
        pipeline = run_extraction_pipeline(file_bytes)
    except Exception as e:
        logger.error(f"[Upload] PDF extraction pipeline failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=422,
            detail=f"Could not read the PDF file. Please ensure it is a valid PDF. Error: {str(e)}"
        )

    extracted_text = pipeline["text"]
    patient_fields = pipeline["patient_fields"]
    is_scanned = pipeline["is_scanned"]
    engine_used = pipeline["engine_used"]

    logger.info(
        f"[Upload] Extraction complete | engine={engine_used} | "
        f"chars={len(extracted_text)} | scanned={is_scanned}"
    )

    # ── Fallback: Run OCR via vision model if text is sparse or is watermark-only ──
    meaningful_chars = len(extracted_text.replace(" ", "").replace("\n", ""))
    is_watermark_only = "camscanner" in extracted_text.lower().replace(" ", "") and meaningful_chars < 200

    if meaningful_chars < 100 or is_watermark_only or is_scanned:
        logger.info("[Upload] Text is low quality or watermark-only. Attempting OCR extraction via vision model...")
        try:
            from pdf2image import convert_from_bytes
            import config as cfg
            # Render PDF pages to images
            images = convert_from_bytes(file_bytes, dpi=180, poppler_path=cfg.POPPLER_PATH)
            
            ocr_texts = []
            # Ask Gemini to OCR each page image
            for idx, img in enumerate(images[:5]):
                logger.info(f"[OCR] Processing page {idx+1} for text extraction...")
                ocr_prompt = "Perform OCR on this medical report page image. Extract and return ALL text, numbers, values, units, reference ranges, and flags exactly as written. Do not summarize. Do not write anything else besides the extracted text."
                
                page_text = ""
                # Try primary model first, fallback to alternate model on failure
                for model_choice in ["models/gemini-flash-latest", "models/gemini-2.0-flash", "models/gemini-2.5-pro"]:
                    try:
                        response = ai_service.client.models.generate_content(
                            model=model_choice,
                            contents=[ocr_prompt, img],
                        )
                        page_text = response.text or ""
                        if page_text.strip():
                            logger.info(f"[OCR] Page {idx+1} successfully read using {model_choice}.")
                            break
                    except Exception as page_err:
                        logger.warning(f"[OCR] Page {idx+1} failed with {model_choice}: {page_err}")
                
                if page_text:
                    ocr_texts.append(page_text)
            
            combined_ocr = "\n".join(ocr_texts).strip()
            
            # Clean OCR text: remove CamScanner watermarks, normalize spacing
            cleaned_ocr = re.sub(r'(?i)CamScanner', '', combined_ocr)
            cleaned_ocr = re.sub(r' {2,}', ' ', cleaned_ocr)
            cleaned_ocr = cleaned_ocr.strip()
            
            ocr_meaningful = len(cleaned_ocr.replace(" ", "").replace("\n", ""))
            if ocr_meaningful >= 50:
                logger.info(f"[OCR] Successfully extracted {len(cleaned_ocr)} characters of medical text via OCR.")
                extracted_text = cleaned_ocr
                is_scanned = True
                engine_used = "vision_ocr"
                meaningful_chars = ocr_meaningful
                
                # Also try to re-extract patient fields from the OCR text
                from pdf_extractor import extract_patient_fields
                pd = extract_patient_fields(cleaned_ocr)
                patient_fields = pd["fields"]
            else:
                logger.warning("[OCR] OCR returned insufficient text.")
        except Exception as ocr_err:
            logger.error(f"[OCR] OCR process failed: {ocr_err}", exc_info=True)

    # ── Validate: enough text to analyze? ─────────────────────────────────────
    if meaningful_chars < MIN_TEXT_FOR_ANALYSIS:
        msg = "This scanned PDF could not be read clearly. Please upload a clearer scan or image."
        logger.warning(f"[Upload] Insufficient text extracted after OCR attempt: {meaningful_chars} meaningful chars")
        raise HTTPException(status_code=422, detail=msg)

    # ── Stage 4: AI Analysis ──────────────────────────────────────────────────
    logger.info("[Upload] Starting AI analysis with Gemini...")
    try:
        # Resolve user account
        if user_id:
            db_user = db.query(models.User).filter(models.User.id == user_id).first()
        else:
            db_user = None

        if db_user:
            # Returning user — check history for trend analysis
            historical_reports = (
                db.query(models.Report)
                .filter(models.Report.user_id == db_user.id)
                .order_by(models.Report.timestamp.asc())
                .all()
            )
            if len(historical_reports) > 0:
                logger.info(f"[Upload] Found {len(historical_reports)} historical reports — running trend analysis")
                historical_texts = [r.extracted_text for r in historical_reports if r.extracted_text]
                ai_result = ai_service.analyze_trend_with_gemini(historical_texts, extracted_text)
                _apply_verified_fields(ai_result, patient_fields)
            else:
                ai_result = ai_service.analyze_with_ai(
                    extracted_text=extracted_text,
                    patient_fields=patient_fields,
                    pdf_bytes=file_bytes if is_scanned else None,
                    is_scanned=is_scanned,
                )
        else:
            # Anonymous upload
            ai_result = ai_service.analyze_with_ai(
                extracted_text=extracted_text,
                patient_fields=patient_fields,
                pdf_bytes=file_bytes if is_scanned else None,
                is_scanned=is_scanned,
            )

            # Determine patient name for auto-account creation
            patient_name = ai_result.get("patient_name") or patient_fields.get("patient_name", {}).get("value")
            if not patient_name or patient_name.lower() in ("not found", "n/a", "none", "", "null"):
                patient_name = None  # Stay anonymous

            if patient_name:
                # Auto-create or find existing account
                db_user = db.query(models.User).filter(models.User.name == patient_name).first()
                if db_user:
                    # Returning patient — try trend analysis
                    historical_reports = (
                        db.query(models.Report)
                        .filter(models.Report.user_id == db_user.id)
                        .order_by(models.Report.timestamp.asc())
                        .all()
                    )
                    if len(historical_reports) > 0:
                        try:
                            historical_texts = [r.extracted_text for r in historical_reports if r.extracted_text]
                            ai_result = ai_service.analyze_trend_with_gemini(historical_texts, extracted_text)
                            _apply_verified_fields(ai_result, patient_fields)
                        except Exception as trend_err:
                            logger.warning(f"[Upload] Trend analysis failed, using single-report result: {trend_err}")
                else:
                    # New patient — create account
                    safe_name = patient_name.lower().replace(' ', '').replace(',', '')
                    fake_email = f"{safe_name}@auto.generated"
                    db_user = models.User(email=fake_email, name=patient_name)
                    db.add(db_user)
                    db.commit()
                    db.refresh(db_user)
                    logger.info(f"[Upload] Auto-created user account for patient: {patient_name!r}")
            else:
                # Truly anonymous — create a generic account
                import uuid
                anon_email = f"anon-{uuid.uuid4().hex[:8]}@auto.generated"
                db_user = models.User(email=anon_email, name="Anonymous Patient")
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                logger.info(f"[Upload] Created anonymous user account: {anon_email}")

    except HTTPException:
        raise
    except ValueError as e:
        # ai_service raises ValueError for insufficient text
        logger.warning(f"[Upload] AI pre-validation failed: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        # Gemini client issues or model failures
        logger.error(f"[Upload] AI RuntimeError: {e}", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=(
                f"AI analysis service is unavailable: {str(e)}. "
                "Please check that HEALTH_AI_API is set to a valid Gemini API key in backend/.env."
            )
        )
    except Exception as e:
        logger.error(f"[Upload] Unexpected AI analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")

    # ── Log final AI result summary ───────────────────────────────────────────
    params = ai_result.get("extracted_parameters", [])
    abnormal = sum(1 for p in params if p.get("status", "normal") != "normal")
    normal = len(params) - abnormal
    logger.info(
        f"[Upload] AI result summary: "
        f"disease_type={ai_result.get('disease_type')!r} | "
        f"risk_score={ai_result.get('risk_score')} | "
        f"params={len(params)} ({abnormal} abnormal, {normal} normal) | "
        f"overall_status={ai_result.get('overall_status')!r}"
    )

    # ── Build final patient name / age with fallback priority ────────────────
    final_name = _resolve_field(
        patient_fields.get("patient_name", {}).get("value"),
        ai_result.get("patient_name"),
        db_user.name if db_user else None
    )
    final_age = _resolve_field(
        patient_fields.get("age", {}).get("value"),
        ai_result.get("patient_age")
    )

    # ── Persist Report ────────────────────────────────────────────────────────
    text_to_store = extracted_text or f"Scanned PDF — AI Vision Analyzed: {ai_result.get('disease_type', 'Unknown')}"

    db_report = models.Report(
        user_id=db_user.id if db_user else None,
        pdf_filename=file.filename,
        extracted_text=text_to_store,
        patient_name=final_name,
        patient_age=final_age,
        disease_type=ai_result.get("disease_type") or "General Health",
        risk_score=float(ai_result.get("risk_score") or 0.0),
        concerns=ai_result.get("concerns") or "",
        exercise_plan=ai_result.get("exercise_plan") or "",
        food_plan=ai_result.get("food_plan") or "",
        overall_status=ai_result.get("overall_status") or "Low Risk",
        extracted_parameters=ai_result.get("extracted_parameters") or [],
        potential_diseases=ai_result.get("potential_diseases") or [],
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    logger.info(f"[Upload] Report saved with ID={db_report.id} for user_id={db_report.user_id}")

    # ── Store extra AI fields in the response dict (not in DB model) ──────────
    # We add doctor_questions and next_steps to the returned object
    # so the frontend can use them directly without fetching again.
    # These are not saved in the DB model (which is fine — they can be regenerated).
    response_data = schemas.Report.model_validate(db_report)
    # Attach extra fields as dynamic attributes for the JSON response
    response_dict = response_data.model_dump()
    response_dict["doctor_questions"] = ai_result.get("doctor_questions") or []
    response_dict["next_steps"] = ai_result.get("next_steps") or []
    response_dict["extraction_engine"] = engine_used
    response_dict["is_scanned_pdf"] = is_scanned

    # FastAPI Response: Return the dict directly so extra fields are included
    from fastapi.responses import JSONResponse
    return JSONResponse(content=_serialize(response_dict))


@router.get("/reports/{report_id}", response_model=schemas.Report)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
):
    """Fetch a saved report by ID."""
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if credentials and credentials.credentials:
        try:
            idinfo = id_token.verify_oauth2_token(credentials.credentials, requests.Request())
            email = idinfo.get('email')
            db_user = db.query(models.User).filter(models.User.email == email).first()
            if db_user and report.user_id and report.user_id != db_user.id:
                raise HTTPException(status_code=403, detail="Access denied: report belongs to another user")
        except (ValueError, Exception):
            pass  # Treat as anonymous

    return report


# ─── Internal Helpers ─────────────────────────────────────────────────────────

def _apply_verified_fields(ai_result: dict, patient_fields: dict) -> None:
    """Force regex-extracted patient info into AI result (prevents AI hallucination)."""
    for key, ai_key in [("patient_name", "patient_name"), ("age", "patient_age"), ("gender", "gender")]:
        val = patient_fields.get(key, {}).get("value")
        if val and val not in ("Not Found", "N/A", "", None):
            ai_result[ai_key] = val


def _resolve_field(*values) -> Optional[str]:
    """Return the first non-null, non-'Not Found' value from the list."""
    for v in values:
        if v and str(v).strip().lower() not in ("not found", "n/a", "none", "null", ""):
            return str(v).strip()
    return None


def _serialize(obj):
    """Recursively convert datetime objects to ISO strings for JSON serialization."""
    import datetime
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    return obj
