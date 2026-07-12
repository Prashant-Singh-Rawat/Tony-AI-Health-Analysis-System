"""
Multi-Stage Medical PDF Extraction Pipeline
============================================
Stage 1 – Text extraction: pdfplumber → PyMuPDF → PyPDF2
Stage 2 – Text cleaning: normalize whitespace, fix PDF artifacts
Stage 3 – Regex: detect patient name, age, gender, hospital, doctor, date, blood group
Stage 4 – Confidence scoring: per-field confidence 0-100

CRITICAL RULES
- Never invent or hallucinate any patient information.
- If a field cannot be extracted confidently → return "Not Found".
- AI (Gemini) structures and interprets already-extracted text only.
"""

import re
import logging
from typing import Optional
from io import BytesIO

logger = logging.getLogger(__name__)

# ─── Minimum text to consider a PDF "readable" ───────────────────────────────
MIN_MEANINGFUL_CHARS = 150   # If < 150 non-whitespace chars → treat as scanned


# ─── Stage 1: Multi-Engine Text Extraction ────────────────────────────────────

def extract_with_pdfplumber(pdf_bytes: bytes) -> str:
    """Best for digital PDFs with tables (lab reports). Preserves layout."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # Plain text extraction
                page_text = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                if page_text.strip():
                    text_parts.append(page_text)

                # Table text extraction (lab values are often in tables)
                tables = page.extract_tables() or []
                for table in tables:
                    for row in table:
                        if row:
                            row_cells = [str(cell or "").strip() for cell in row if cell]
                            row_text = " | ".join(row_cells)
                            if row_text.strip() and len(row_text) > 3:
                                text_parts.append(row_text)

        combined = "\n".join(text_parts).strip()
        logger.info(f"[pdfplumber] Extracted {len(combined)} chars")
        return combined
    except Exception as e:
        logger.warning(f"[pdfplumber] Failed: {e}")
        return ""


def extract_with_pymupdf(pdf_bytes: bytes) -> str:
    """Fast, excellent for most digital PDFs."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = []
        for page_num, page in enumerate(doc):
            # Use blocks mode for better layout preservation
            text = page.get_text("text")
            if text.strip():
                text_parts.append(text)
        doc.close()
        combined = "\n".join(text_parts).strip()
        logger.info(f"[PyMuPDF] Extracted {len(combined)} chars")
        return combined
    except Exception as e:
        logger.warning(f"[PyMuPDF] Failed: {e}")
        return ""


def extract_with_pypdf2(pdf_bytes: bytes) -> str:
    """Fallback text extraction."""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
        text_parts = []
        for page in reader.pages:
            t = page.extract_text()
            if t and t.strip():
                text_parts.append(t)
        combined = "\n".join(text_parts).strip()
        logger.info(f"[PyPDF2] Extracted {len(combined)} chars")
        return combined
    except Exception as e:
        logger.warning(f"[PyPDF2] Failed: {e}")
        return ""


def is_scanned_pdf(text: str) -> bool:
    """
    Detect if the PDF has very little extractable text (image-only/scanned).
    Uses MIN_MEANINGFUL_CHARS threshold — much more conservative than before.
    """
    meaningful = re.sub(r'\s+', '', text)  # Remove all whitespace
    result = len(meaningful) < MIN_MEANINGFUL_CHARS
    if result:
        logger.info(f"[Extractor] PDF flagged as scanned (only {len(meaningful)} meaningful chars)")
    return result


def extract_best_text(pdf_bytes: bytes) -> dict:
    """
    Try all engines. Pick the one with the most extracted text.
    Returns: {text, engine_used, is_scanned, char_counts}
    """
    results = {
        'pdfplumber': extract_with_pdfplumber(pdf_bytes),
        'pymupdf': extract_with_pymupdf(pdf_bytes),
        'pypdf2': extract_with_pypdf2(pdf_bytes),
    }

    char_counts = {k: len(v) for k, v in results.items()}
    logger.info(f"[Extractor] Engine char counts: {char_counts}")

    # Pick the engine with the most text
    best_engine = max(results, key=lambda k: len(results[k]))
    best_text = results[best_engine]

    # If pdfplumber and pymupdf disagree significantly, prefer pdfplumber for tables
    plumber_len = len(results['pdfplumber'])
    mupdf_len = len(results['pymupdf'])
    if plumber_len > 100 and plumber_len >= mupdf_len * 0.7:
        best_engine = 'pdfplumber'
        best_text = results['pdfplumber']
        logger.info(f"[Extractor] Preferring pdfplumber (better for lab tables)")

    scanned = is_scanned_pdf(best_text)
    logger.info(f"[Extractor] Best engine: {best_engine} ({len(best_text)} chars) | scanned={scanned}")

    return {
        "text": best_text,
        "engine_used": best_engine,
        "is_scanned": scanned,
        "char_counts": char_counts,
    }


# ─── Stage 2: Text Cleaning ───────────────────────────────────────────────────

def clean_text(raw_text: str) -> str:
    """
    Normalize the extracted text:
    - Remove control characters and PDF artifacts
    - Fix hyphenated line breaks
    - Normalize whitespace
    - Preserve meaningful line breaks (don't collapse table rows)
    """
    if not raw_text:
        return ""

    text = raw_text

    # Remove control characters (but keep newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', ' ', text)

    # Fix hyphenated line breaks (word- \n continuation)
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)

    # Merge lines that are clearly mid-sentence (lowercase → lowercase)
    text = re.sub(r'(?<=[a-z])\n(?=[a-z])', ' ', text)

    # Normalize multiple spaces (preserve single ones)
    text = re.sub(r' {3,}', '  ', text)

    # Reduce excessive blank lines
    text = re.sub(r'\n{4,}', '\n\n', text)

    # Remove page number artifacts
    text = re.sub(r'(Page\s*\d+\s*of\s*\d+)', '', text, flags=re.IGNORECASE)

    # Strip trailing whitespace per line
    lines = [line.rstrip() for line in text.splitlines()]
    text = '\n'.join(lines)

    return text.strip()


# ─── Stage 3: Regex / NLP Field Extraction ───────────────────────────────────

def extract_patient_name(text: str) -> tuple:
    """
    Extract patient name. Returns (name, confidence%).
    Patterns ordered most-specific → least-specific.
    """
    patterns = [
        # "Patient Name: John Smith" / "Patient: John Smith"
        r'(?i)Patient\s*(?:Name|ID)?(?:\s*No\.?)?\s*[:\-\|]\s*([A-Z][a-zA-Z\s\.]{2,50}?)(?:\s{2,}|\n|$|\d)',
        # "Name: John Smith"
        r'(?i)\bName\s*[:\-\|]\s*([A-Z][a-zA-Z\s\.]{2,50}?)(?:\s{2,}|\n|$|\d)',
        # "Pt Name:" / "Pt. Name:"
        r'(?i)Pt\.?\s*Name\s*[:\-\|]\s*([A-Z][a-zA-Z\s\.]{2,50}?)(?:\s{2,}|\n|$|\d)',
        # "Beneficiary:" / "Client Name:" / "Candidate:"
        r'(?i)(?:Beneficiary|Client\s*Name|Consumer|Candidate|Member\s*Name)\s*[:\-\|]\s*([A-Z][a-zA-Z\s\.]{2,50}?)(?:\s{2,}|\n|$|\d)',
        # Honorific prefix: "Mr. / Mrs. / Miss / Master / Ms. / Dr."
        r'(?i)(?:Mr\.|Mrs\.|Miss\s|Master\s|Ms\.|Dr\.)\s*([A-Z][a-zA-Z\s\.]{2,45}?)(?:\s{2,}|\n|$|\d)',
    ]

    for i, pattern in enumerate(patterns):
        m = re.search(pattern, text)
        if m:
            name = m.group(1).strip()
            # Remove trailing noise words
            name = re.sub(
                r'\s+(DOB|D\.O\.B|Age|Gender|Male|Female|M\b|F\b|Reg|Ref|Report|Date|Dt|No\.|ID|S/O|W/O|D/O).*$',
                '', name, flags=re.IGNORECASE
            ).strip()
            name = re.sub(r'[^a-zA-Z\s\.]', '', name).strip()
            # Must be at least 2 words and at least 4 chars
            if len(name.split()) >= 2 and len(name) >= 4:
                conf = 98 - (i * 5)
                logger.info(f"[Name] Found '{name}' via pattern #{i + 1} (conf={conf}%)")
                return name, conf

    logger.info("[Name] Not found in text")
    return None, 0


def extract_age(text: str) -> tuple:
    patterns = [
        r'(?i)Age\s*[:\-\|]?\s*(\d{1,3})\s*(?:Yrs?|Years?|Y)?',
        r'(?i)(?:Age\s*\/\s*Sex|Age\/Sex)\s*[:\-\|]?\s*(\d{1,3})',
        r'\b(\d{1,3})\s*(?:Yrs?|Years?)\b',
    ]
    for pattern in patterns:
        m = re.search(pattern, text)
        if m:
            age_val = int(m.group(1))
            if 1 <= age_val <= 120:
                return f"{age_val} Years", 93
    return None, 0


def extract_gender(text: str) -> tuple:
    patterns = [
        r'(?i)Gender\s*[:\-\|]\s*(Male|Female|M\b|F\b)',
        r'(?i)Sex\s*[:\-\|]\s*(Male|Female|M\b|F\b)',
        r'(?i)(?:Age\s*\/\s*Sex|Age\/Sex)\s*[:\-\|]?\s*\d+\s*(?:Yrs?)?\s*/?s*(Male|Female|M\b|F\b)',
        r'\b(Male|Female)\b',
    ]
    mapping = {'M': 'Male', 'F': 'Female'}
    for i, pattern in enumerate(patterns):
        m = re.search(pattern, text)
        if m:
            val = m.group(1).strip()
            val = mapping.get(val.upper(), val.capitalize())
            return val, 97 - (i * 5)
    return None, 0


def extract_dob(text: str) -> tuple:
    patterns = [
        r'(?i)(?:DOB|D\.O\.B|Date\s*of\s*Birth)\s*[:\-\|]\s*(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})',
        r'(?i)(?:DOB|D\.O\.B|Date\s*of\s*Birth)\s*[:\-\|]\s*(\d{1,2}\s+\w+\s+\d{4})',
    ]
    for pattern in patterns:
        m = re.search(pattern, text)
        if m:
            return m.group(1).strip(), 90
    return None, 0


def extract_hospital(text: str) -> tuple:
    """Extract hospital/lab name — usually in the header."""
    # Check first 15 lines first (hospital names usually appear in the header)
    first_lines = text.split('\n')[:15]
    for line in first_lines:
        line = line.strip()
        if len(line) > 8 and re.search(
            r'(?i)(hospital|clinic|lab|diagnostic|medical|health|patholog|centre|center|institute)',
            line
        ):
            clean = re.sub(r'[^\w\s\.,&\-]', '', line).strip()
            if 5 < len(clean) < 100:
                return clean, 80

    # Fallback: labeled pattern
    m = re.search(
        r'(?i)(?:Hospital|Clinic|Lab(?:oratory)?|Centre|Center|Medical|Institute|Diagnostics)\s*[:\-\|]\s*(.{5,80}?)(?:\n|$)',
        text
    )
    if m:
        return m.group(1).strip(), 75

    return None, 0


def extract_doctor(text: str) -> tuple:
    patterns = [
        r'(?i)(?:Referred\s*By|Ref\.?\s*By|Doctor|Physician|Consultant)\s*[:\-\|]\s*(?:Dr\.?\s*)?([A-Z][a-zA-Z\s\.]{3,50}?)(?:\s{2,}|\n|$)',
        r'(?i)Dr\.?\s+([A-Z][a-zA-Z\s\.]{3,45})(?:\n|$|\s{2,})',
    ]
    for i, pattern in enumerate(patterns):
        m = re.search(pattern, text)
        if m:
            doc = m.group(1).strip()
            doc = re.sub(r'[^a-zA-Z\s\.]', '', doc).strip()
            if len(doc) >= 3:
                return doc, 85 - (i * 5)
    return None, 0


def extract_report_date(text: str) -> tuple:
    patterns = [
        r'(?i)(?:Report\s*Date|Collection\s*Date|Sample\s*Date|Specimen\s*Date|Report\s*Time)\s*[:\-\|]\s*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})',
        r'(?i)(?:Date)\s*[:\-\|]\s*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})',
        r'\b(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{4})\b',
    ]
    for i, pattern in enumerate(patterns):
        m = re.search(pattern, text)
        if m:
            return m.group(1).strip(), 88 - (i * 5)
    return None, 0


def extract_blood_group(text: str) -> tuple:
    m = re.search(r'\b(A|B|AB|O)\s*[+-](?:ve|)\b', text)
    if m:
        return m.group(0).strip(), 95
    return None, 0


def validate_age_dob_consistency(age_str: Optional[str], dob_str: Optional[str]) -> dict:
    """Cross-check extracted age vs DOB."""
    if not age_str or not dob_str:
        return {"consistent": True, "issues": []}
    try:
        age = int(re.search(r'\d+', age_str).group())
        dob_year = int(re.search(r'\d{4}', dob_str).group())
        import datetime
        current_year = datetime.datetime.now().year
        expected_min = current_year - dob_year - 1
        expected_max = current_year - dob_year

        if not (expected_min <= age <= expected_max + 1):
            return {
                "consistent": False,
                "issues": [f"Age ({age}) doesn't match DOB year ({dob_year}). Expected ~{expected_min}–{expected_max}."]
            }
    except Exception:
        pass
    return {"consistent": True, "issues": []}


# ─── Stage 4: Full Field Extraction ──────────────────────────────────────────

def extract_patient_fields(text: str) -> dict:
    """Run all field extractors. Return structured dict with values and confidence."""
    name, name_conf = extract_patient_name(text)
    age, age_conf = extract_age(text)
    gender, gender_conf = extract_gender(text)
    dob, dob_conf = extract_dob(text)
    hospital, hospital_conf = extract_hospital(text)
    doctor, doctor_conf = extract_doctor(text)
    report_date, date_conf = extract_report_date(text)
    blood_group, bg_conf = extract_blood_group(text)

    validation = validate_age_dob_consistency(age, dob)

    fields = {
        "patient_name": {"value": name or "Not Found",       "confidence": name_conf},
        "age":          {"value": age or "Not Found",        "confidence": age_conf},
        "gender":       {"value": gender or "Not Found",     "confidence": gender_conf},
        "dob":          {"value": dob or "Not Found",        "confidence": dob_conf},
        "hospital":     {"value": hospital or "Not Found",   "confidence": hospital_conf},
        "doctor":       {"value": doctor or "Not Found",     "confidence": doctor_conf},
        "report_date":  {"value": report_date or "Not Found","confidence": date_conf},
        "blood_group":  {"value": blood_group or "Not Found","confidence": bg_conf},
    }

    logger.info(f"[Fields] name={name!r}(conf={name_conf}) | age={age!r} | gender={gender!r} | date={report_date!r}")

    return {"fields": fields, "validation": validation}


# ─── Main Entry Point ─────────────────────────────────────────────────────────

def run_extraction_pipeline(pdf_bytes: bytes) -> dict:
    """
    Full multi-stage PDF extraction pipeline.

    Returns:
    {
        "text": str,              # Best extracted + cleaned text
        "engine_used": str,       # Which extractor worked best
        "is_scanned": bool,       # Whether PDF is image-based
        "patient_fields": dict,   # Regex-detected patient fields + confidence
        "char_counts": dict,      # Per-engine char counts (for debugging)
    }
    """
    logger.info(f"[Pipeline] Starting extraction — PDF size: {len(pdf_bytes)} bytes")

    # Stage 1: Extract text from PDF
    extraction = extract_best_text(pdf_bytes)
    raw_text = extraction["text"]

    # Stage 2: Clean text
    clean = clean_text(raw_text)
    logger.info(f"[Pipeline] Cleaned text length: {len(clean)} chars")
    logger.info(f"[Pipeline] Text sample:\n{clean[:300]}")

    # Stage 3: Extract patient fields via regex
    patient_data = extract_patient_fields(clean)

    return {
        "text": clean,
        "engine_used": extraction["engine_used"],
        "is_scanned": extraction["is_scanned"],
        "patient_fields": patient_data["fields"],
        "validation": patient_data["validation"],
        "char_counts": extraction.get("char_counts", {}),
    }
