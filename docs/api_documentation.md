# API Documentation: Tony Health Analysis Backend

This document details all API controllers exposed by the FastAPI backend server.

---

## Base Configuration
*   **Default Port:** `8000`
*   **Development Root URL:** `http://localhost:8000`
*   **Production URL:** Managed by environment variable `VITE_API_URL` or Render setup.

---

## 1. Authentication Router

### Register User
*   **Endpoint:** `/auth/register`
*   **Method:** `POST`
*   **Auth Required:** None
*   **Request Body (`UserRegister`):**
    ```json
    {
      "email": "user@example.com",
      "name": "Jane Doe",
      "password": "strongpassword123"
    }
    ```
*   **Response (`User`):**
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "name": "Jane Doe",
      "created_at": "2026-07-09T14:44:40"
    }
    ```

### Login User
*   **Endpoint:** `/auth/login`
*   **Method:** `POST`
*   **Auth Required:** None
*   **Request Body (`UserLogin`):**
    ```json
    {
      "email": "user@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Response (`User`):** Returns user details on success, or HTTP 400 for bad password/missing accounts.

### Verify Google OAuth Token
*   **Endpoint:** `/auth/google`
*   **Method:** `POST`
*   **Auth Required:** None
*   **Request Body (`GoogleAuth`):**
    ```json
    {
      "token": "google_identity_provider_jwt_string"
    }
    ```
*   **Response (`User`):** Resolves/auto-creates a user record and returns the user object.

---

## 2. Report Router

### Upload and Analyze Report
*   **Endpoint:** `/upload_report`
*   **Method:** `POST`
*   **Auth Required:** Optional (Uses optional `user_id` form field)
*   **Request Content-Type:** `multipart/form-data`
*   **Form Data:**
    *   `file`: PDF file bytes (Scanned or digital).
    *   `user_id` (optional): The ID of the authenticated user.
*   **Response (`Report`):**
    ```json
    {
      "id": 12,
      "user_id": 1,
      "timestamp": "2026-07-09T14:45:00",
      "pdf_filename": "blood_work.pdf",
      "extracted_text": "...",
      "patient_name": "Jane Doe",
      "patient_age": "32",
      "disease_type": "Biochemistry",
      "risk_score": 15.5,
      "concerns": "Mildly elevated cholesterol.",
      "exercise_plan": "30 mins light cardio.",
      "food_plan": "Incorporate fiber and limit saturated fats.",
      "overall_status": "Low Risk",
      "extracted_parameters": [
        {
          "name": "Cholesterol",
          "value": "210",
          "unit": "mg/dL",
          "reference_interval": "[120-200]",
          "status": "high"
        }
      ],
      "potential_diseases": ["Hypercholesterolemia"]
    }
    ```

### Get All User Reports
*   **Endpoint:** `/reports`
*   **Method:** `GET`
*   **Auth Required:** Yes (Bearer Token)
*   **Response:** List of `Report` schemas belonging to the user session.

### Get Report by ID
*   **Endpoint:** `/reports/{report_id}`
*   **Method:** `GET`
*   **Auth Required:** Optional (Checks ownership validation only if a Bearer Token header is passed). Allows anonymous viewing for guest-uploaded reports.
*   **Response:** `Report` schema object.

---

## 3. GPS Finder Router

### Find Nearby Hospitals
*   **Endpoint:** `/nearby-hospitals`
*   **Method:** `POST`
*   **Auth Required:** None
*   **Request Body (`LocationRequest`):**
    ```json
    {
      "latitude": 28.6139,
      "longitude": 77.2090
    }
    ```
*   **Response:**
    ```json
    {
      "hospitals": [
        {
          "id": 1234567,
          "name": "City Cardiology Center",
          "phone": "+91-11-2345678",
          "website": "http://citycardiology.com",
          "latitude": 28.6145,
          "longitude": 77.2105,
          "distance_km": 0.18
        }
      ]
    }
    ```
