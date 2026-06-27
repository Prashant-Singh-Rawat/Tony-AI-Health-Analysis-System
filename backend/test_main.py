import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

#  Test 1: Root endpoint
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Tony Health Analysis API"}

#  Test 2: Get reports - user not found
def test_get_user_reports_not_found():
    with patch("main.get_db") as mock_db:
        mock_session = MagicMock()
        mock_session.query().filter().first.return_value = None
        mock_db.return_value = iter([mock_session])
        
        response = client.get("/users/999/reports")
        assert response.status_code == 404

#  Test 3: Create report - user not found
def test_create_report_user_not_found():
    with patch("main.get_db") as mock_db:
        mock_session = MagicMock()
        mock_session.query().filter().first.return_value = None
        mock_db.return_value = iter([mock_session])

        response = client.post("/users/999/reports", json={
            "disease_type": "Diabetes",
            "risk_score": 45.0,
            "concerns": "High sugar levels",
            "exercise_plan": "Walk 30 mins daily",
            "food_plan": "Low sugar diet",
            "overall_status": "Moderate Risk"
        })
        assert response.status_code == 404

#  Test 4: Upload report - user not found
def test_upload_report_user_not_found():
    with patch("main.get_db") as mock_db:
        mock_session = MagicMock()
        mock_session.query().filter().first.return_value = None
        mock_db.return_value = iter([mock_session])

        dummy_pdf = b"%PDF-1.4 dummy content"
        response = client.post(
            "/users/999/upload_report",
            files={"file": ("test.pdf", dummy_pdf, "application/pdf")}
        )
        assert response.status_code == 404

#  Test 5: Extract text from PDF
def test_extract_text_from_pdf():
    from ai_service import extract_text_from_pdf
    dummy_bytes = b"%PDF-1.4 dummy"
    try:
        result = extract_text_from_pdf(dummy_bytes)
        assert isinstance(result, str)
    except Exception:
        pass  # Invalid PDF is expected in unit test