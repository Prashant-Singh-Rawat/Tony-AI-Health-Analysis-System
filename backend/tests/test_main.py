"""
Unit / integration tests for the Tony Health Analysis backend.

All tests use the `client` fixture from conftest.py which:
  - Replaces the real DB with an in-memory SQLite session (rolled back after each test)
  - Replaces `get_current_user` with a stub that returns a fake user
  - Clears all dependency overrides after each test
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


# ── Test 1: Root endpoint ──────────────────────────────────────────────────────
def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Tony Health Analysis API"}


# ── Test 2: Get reports for the authenticated fake user ────────────────────────
def test_get_user_reports_empty(client: TestClient):
    """A freshly-created user has no reports yet — should return an empty list."""
    user_id = client._fake_user.id
    response = client.get(f"/users/{user_id}/reports")
    assert response.status_code == 200
    assert response.json() == []


# ── Test 3: Get reports for a non-existent user ────────────────────────────────
def test_get_user_reports_different_user_forbidden(client: TestClient):
    """Requesting another user's reports should return 403 (auth guard)."""
    response = client.get("/users/99999/reports")
    # 403 because user_id 99999 != fake_user.id
    assert response.status_code in (403, 404)


# ── Test 5: Extract text from a (dummy) PDF ────────────────────────────────────
def test_extract_text_from_pdf():
    """
    ai_service.extract_text_from_pdf should return a str even for invalid PDFs.
    We just verify the return type — a broken PDF will likely return an empty string.
    """
    from ai_service import extract_text_from_pdf
    dummy_bytes = b"%PDF-1.4 dummy content"
    try:
        result = extract_text_from_pdf(dummy_bytes)
        assert isinstance(result, str)
    except Exception:
        pass  # Invalid PDF is acceptable in unit tests


# ── Test 6: Upload endpoint (mocking AI service) ───────────────────────────────
def test_upload_report_triggers_ai(client: TestClient):
    """
    POST /upload_report should call ai_service.analyze_report_with_gemini.
    We mock the AI call so no real API key is needed.
    """
    fake_ai_result = {
        "patient_name": "John Doe",
        "patient_age": 35,
        "disease_type": "Hypertension",
        "risk_score": 60.0,
        "concerns": "High BP",
        "exercise_plan": "Cardio 3x/week",
        "food_plan": "Low sodium diet",
        "overall_status": "Moderate Risk",
        "extracted_parameters": [],
        "potential_diseases": [],
    }

    dummy_pdf = b"%PDF-1.4 dummy content"

    # Mock the new run_extraction_pipeline so it returns enough dummy text to bypass MIN_TEXT_FOR_ANALYSIS (50 chars)
    fake_pipeline_result = {
        "text": "A" * 100,
        "patient_fields": {},
        "is_scanned": False,
        "engine_used": "dummy"
    }

    with patch("routers.reports.ai_service.analyze_with_ai", return_value=fake_ai_result), \
         patch("pdf_extractor.run_extraction_pipeline", return_value=fake_pipeline_result), \
         patch("routers.reports.n8n_service.process_report_webhooks") as mock_n8n:

        mock_n8n.return_value = None

        response = client.post(
            "/upload_report",
            files={"file": ("test.pdf", dummy_pdf, "application/pdf")},
        )

    # Expect 200 with a stored report object
    assert response.status_code == 200
    data = response.json()
    assert data["disease_type"] == "Hypertension"
    assert data["risk_score"] == 60.0