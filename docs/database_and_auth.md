# Database and Authentication Architecture

This document describes the schema structure, data connections, and verification flows in the Tony Health System.

---

## 1. Database Schema (SQLAlchemy Models)

```mermaid
erDiagram
    users ||--o{ reports : owns
    users {
        int id PK
        string email UNIQUE
        string name
        string google_id UNIQUE
        string hashed_password
        datetime created_at
    }
    reports {
        int id PK
        int user_id FK
        datetime timestamp
        string pdf_filename
        text extracted_text
        string patient_name
        string patient_age
        string disease_type
        float risk_score
        text concerns
        text exercise_plan
        text food_plan
        string overall_status
        json extracted_parameters
        json potential_diseases
    }
```

### Table: `users`
*   `id` (Integer, Primary Key): Unique identifier for users.
*   `email` (String, Unique): E-mail address.
*   `name` (String): Display name.
*   `google_id` (String, Nullable): Stored identifier for users authenticating via Google.
*   `hashed_password` (String, Nullable): Bcrypt password hashes for standard email/pass users.
*   `created_at` (DateTime): Registration timestamp.

### Table: `reports`
*   `id` (Integer, Primary Key): Unique identifier for reports.
*   `user_id` (Integer, Foreign Key): Maps reports to a specific user. Nullable for anonymous uploads.
*   `pdf_filename` (String): Stored filename.
*   `extracted_text` (Text): The raw text extracted directly or synthesized via visual OCR.
*   `disease_type` (String): Short categorization (e.g. "Cardiology").
*   `risk_score` (Float): Overall health risk representation (0.0 to 100.0).
*   `extracted_parameters` (JSON): A list of parsed parameters, including names, values, units, reference intervals, and status flags.
*   `potential_diseases` (JSON): List of conditions the patient might be at risk for based on parameters.

---

## 2. Authentication Flow

The backend verifies authentication through standard token validation.

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client
    participant API as FastAPI Backend
    participant Google as Google Auth API
    participant DB as SQL Database

    Note over Client, Google: Google Auth Login
    Client->>Google: Authenticate user & get ID token
    Google-->>Client: Return JWT Token (id_token)
    Client->>API: POST /auth/google {token: id_token}
    API->>Google: Verify JWT Token Signature
    Google-->>API: Returns verified payload (email, name, sub)
    API->>DB: Check if user exists (by email)
    alt User does not exist
        API->>DB: Create User record with google_id
    end
    API-->>Client: Returns User session object

    Note over Client, DB: Authenticated API Calls
    Client->>API: GET /reports (Header: Bearer id_token)
    API->>Google: Verify id_token validity
    Google-->>API: Validated payload (email)
    API->>DB: Query User & reports matching email
    DB-->>API: Return reports list
    API-->>Client: Return reports JSON
```
