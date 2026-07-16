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
    if int(user_id) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these reports")
        
    return (
        db.query(models.Report)
        .filter(models.Report.user_id == current_user.id)
        .filter(models.Report.is_deleted == False)
        .order_by(models.Report.timestamp.asc())
        .all()
    )


@router.get("/reports", response_model=list[schemas.Report])
def get_all_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Report)
        .filter(models.Report.user_id == current_user.id)
        .filter(models.Report.is_deleted == False)
        .order_by(models.Report.timestamp.asc())
        .all()
    )


@router.post("/upload_report", response_model=schemas.Report)
async def upload_and_analyze_report(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a medical report PDF, extract text, run AI analysis, and save the result.
    Strictly isolated to the authenticated user.
    """
    # ── Read file ─────────────────────────────────────────────────────────────
    file_bytes = await file.read()
    logger.info(f"[Upload] File received: '{file.filename}' | Size: {len(file_bytes)} bytes")

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty. Please upload a valid PDF medical report."
        )

    # ── Duplicate detection ───────────────────────────────────────────────────
    import hashlib, json as _json
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    existing = (
        db.query(models.Report)
        .filter(models.Report.pdf_filename == file.filename)
        .filter(models.Report.user_id == current_user.id)
        .filter(models.Report.is_deleted == False)
        .filter(models.Report.extracted_text.isnot(None))
        .order_by(models.Report.timestamp.desc())
        .first()
    )
    if existing:
        logger.info(f"[Upload] Duplicate detected for user {current_user.id} — returning cached report ID={existing.id}")
        from fastapi.responses import JSONResponse
        cached = schemas.Report.model_validate(existing).model_dump()
        return JSONResponse(content=_serialize(cached))

    # ── Stage 1–3: Extract text from PDF ─────────────────────────────────────
    logger.info("[Upload] Starting multi-engine PDF extraction pipeline...")
    from pdf_extractor import run_extraction_pipeline
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

    logger.info(f"[Upload] Extraction complete | engine={engine_used} | chars={len(extracted_text)} | scanned={is_scanned}")

    # ── Fallback: Run OCR via vision model ───────────────────────────────────
    meaningful_chars = len(extracted_text.replace(" ", "").replace("\n", ""))
    is_watermark_only = "camscanner" in extracted_text.lower().replace(" ", "") and meaningful_chars < 200

    if meaningful_chars < 100 or is_watermark_only or is_scanned:
        logger.info("[Upload] Text is low quality or watermark-only. Attempting OCR extraction...")
        ocr_text = ""
        
        try:
            from pdf2image import convert_from_bytes
            import config as cfg
            images = convert_from_bytes(file_bytes, dpi=180, poppler_path=cfg.POPPLER_PATH)
            
            ocr_texts = []
            for idx, img in enumerate(images[:5]):
                ocr_prompt = "Perform OCR on this medical report page image. Extract and return ALL text, numbers, values, units, reference ranges, and flags exactly as written. Do not summarize. Do not write anything else besides the extracted text."
                page_text = ""
                for model_choice in ["models/gemini-2.5-flash", "models/gemini-2.0-flash"]:
                    try:
                        response = ai_service.client.models.generate_content(
                            model=model_choice,
                            contents=[ocr_prompt, img],
                        )
                        page_text = response.text or ""
                        if page_text.strip():
                            break
                    except Exception:
                        pass
                if page_text:
                    ocr_texts.append(page_text)
            
            ocr_text = "\n".join(ocr_texts).strip()
        except Exception:
            pass

        if not ocr_text.strip():
            from google.genai import types
            for model_choice in ["models/gemini-2.5-flash", "models/gemini-2.0-flash"]:
                try:
                    prompt = "Perform OCR on this medical report PDF. Extract and return ALL text, numbers, values, units, reference ranges, and flags exactly as written. Do not summarize. Do not write anything else besides the extracted text."
                    pdf_part = types.Part.from_bytes(data=file_bytes, mime_type="application/pdf")
                    response = ai_service.client.models.generate_content(model=model_choice, contents=[prompt, pdf_part])
                    if response.text and response.text.strip():
                        ocr_text = response.text.strip()
                        break
                except Exception:
                    pass

        if ocr_text.strip():
            cleaned_ocr = re.sub(r'(?i)CamScanner', '', ocr_text)
            cleaned_ocr = re.sub(r' {2,}', ' ', cleaned_ocr)
            cleaned_ocr = cleaned_ocr.strip()
            
            ocr_meaningful = len(cleaned_ocr.replace(" ", "").replace("\n", ""))
            if ocr_meaningful >= 50:
                extracted_text = cleaned_ocr
                is_scanned = True
                engine_used = "vision_ocr"
                meaningful_chars = ocr_meaningful
                
                from pdf_extractor import extract_patient_fields
                pd = extract_patient_fields(cleaned_ocr)
                patient_fields = pd["fields"]

    if meaningful_chars < MIN_TEXT_FOR_ANALYSIS:
        raise HTTPException(status_code=422, detail="This scanned PDF could not be read clearly. Please upload a clearer scan or image.")

    # ── Stage 4: AI Analysis ──────────────────────────────────────────────────
    logger.info("[Upload] Starting AI analysis with Gemini...")
    try:
        historical_reports = (
            db.query(models.Report)
            .filter(models.Report.user_id == current_user.id)
            .filter(models.Report.is_deleted == False)
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
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"[Upload] AI RuntimeError: {str(e)}", exc_info=True)
        raise HTTPException(status_code=503, detail="AI analysis service is temporarily unavailable or busy. Please try again.")

    # ── Persist Report ────────────────────────────────────────────────────────
    final_name = _resolve_field(patient_fields.get("patient_name", {}).get("value"), ai_result.get("patient_name"), current_user.name)
    final_age = _resolve_field(patient_fields.get("age", {}).get("value"), ai_result.get("patient_age"))

    text_to_store = extracted_text or f"Scanned PDF — AI Analyzed: {ai_result.get('disease_type', 'Unknown')}"

    db_report = models.Report(
        user_id=current_user.id,
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
        doctor_questions=ai_result.get("doctor_questions") or [],
        next_steps=ai_result.get("next_steps") or [],
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    logger.info(f"[Upload] Report saved with ID={db_report.id} for user_id={db_report.user_id}")

    response_data = schemas.Report.model_validate(db_report)
    response_dict = response_data.model_dump()
    response_dict["extraction_engine"] = engine_used
    response_dict["is_scanned_pdf"] = is_scanned

    from fastapi.responses import JSONResponse
    return JSONResponse(content=_serialize(response_dict))


@router.get("/reports/{report_id}", response_model=schemas.Report)
def get_report(
    report_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch a saved report by ID."""
    report = (
        db.query(models.Report)
        .filter(models.Report.id == report_id)
        .filter(models.Report.is_deleted == False)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: report belongs to another user")

    return report


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft delete a report."""
    report = (
        db.query(models.Report)
        .filter(models.Report.id == report_id)
        .filter(models.Report.is_deleted == False)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: report belongs to another user")

    report.is_deleted = True
    db.commit()
    return


# ─── Internal Helpers ─────────────────────────────────────────────────────────

def _apply_verified_fields(ai_result: dict, patient_fields: dict) -> None:
    for key, ai_key in [("patient_name", "patient_name"), ("age", "patient_age"), ("gender", "gender")]:
        val = patient_fields.get(key, {}).get("value")
        if val and val not in ("Not Found", "N/A", "", None):
            ai_result[ai_key] = val


def _resolve_field(*values) -> Optional[str]:
    for v in values:
        if v and str(v).strip().lower() not in ("not found", "n/a", "none", "null", ""):
            return str(v).strip()
    return None


def _serialize(obj):
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
