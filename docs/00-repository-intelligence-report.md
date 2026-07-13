# Phase 0 — Repository Intelligence Report
> **Verified against live repository on 2026-07-08**  
> **Analyst:** Antigravity AI Architect  
> **Status:** ✅ Complete — Checkpoint cleared

---

## 0.1 Structural Inventory

### Verified Directory Tree

```
Heart-AI-System/                        ← repo root (branch: master)
│
├── backend/
│   ├── main.py          (306 lines)    ← FastAPI app + all routes + n8n webhook calls
│   ├── ai_service.py    (189 lines)    ← Gemini 2.5-flash Vision+Text + PDF analysis
│   ├── n8n_service.py   (118 lines)    ← n8n webhook triggers
│   ├── database.py      (29 lines)     ← SQLAlchemy engine, SQLite/Postgres dual-mode
│   ├── models.py        (46 lines)     ← User + Report ORM models
│   ├── schemas.py       (50 lines)     ← Pydantic schemas
│   ├── requirements.txt (16 lines)     ← Python deps (no version pins)
│   ├── .env             ← GITIGNORED (contains live secrets)
│   ├── .env.example     ← Updated this session (n8n vars added)
│   ├── tonyhealth.db    ← SQLite dev database (committed to repo — risk)
│   ├── list_models.py   ← Utility script to list Gemini models
│   ├── test_main.py     ← Root-level test file (legacy, empty/minimal)
│   └── tests/
│       └── test_main.py ← Extended test file
│
├── frontend/
│   ├── index.html       ← Vite entry
│   ├── vite.config.js   ← base: '/Tony-AI-Health-Analysis-System/', Tailwind plugin
│   ├── package.json     ← React 19, Vite 8, Tailwind CSS 4, recharts, jsPDF, etc.
│   ├── .env             ← VITE_API_URL + VITE_GOOGLE_CLIENT_ID (COMMITTED — risk)
│   └── src/
│       ├── main.jsx     ← React entry, GoogleOAuthProvider wrapper
│       ├── App.jsx      ← HashRouter + 8 routes
│       ├── App.css
│       ├── index.css
│       ├── pages/
│       │   ├── LandingPage.jsx   (581 lines / 33KB) ← Hero + FAQ + chat + hospital
│       │   ├── Dashboard.jsx     (309 lines / 16KB) ← Reports + radar chart + mock data
│       │   ├── Analysis.jsx      (116 lines / 4KB)  ← PDF upload + /upload_report call
│       │   ├── Report.jsx        (348 lines / 19KB) ← Report detail + jsPDF download
│       │   ├── HospitalFinder.jsx (2.5KB)
│       │   ├── MedicinePrices.jsx (2.5KB)
│       │   ├── Services.jsx       (17KB)
│       │   └── PatientCorner.jsx  (17KB)
│       ├── components/
│       │   ├── AuthModal.jsx  (263 lines / 10KB) ← Login/Register/Google OAuth modal
│       │   └── MainNav.jsx    (243 lines / 14KB) ← Nav + live hospital dropdown via Overpass
│       ├── assets/
│       │   └── logo.png
│       └── tests/
│           ├── App.test.jsx
│           └── setup.js
│
├── n8n/                    
│   ├── heart-ai-workflows.json
│   └── README.md
│
├── docs/                   
│   ├── diagrams/
│   ├── adr/
│   └── integrations/
│
├── legacy/                 
│
├── .github/
│   └── workflows/
│       └── ci.yml          (135 lines) ← CI: ML validate → backend lint+test → frontend → deploy
│
├── app.py              ← Streamlit prototype (13 features, RandomForest, NOT connected to main app)
├── train_model.py      ← RandomForest training script (legacy)
├── test_model.py       ← RandomForest sanity tests (used by CI!)
├── heart_model.pkl     ← Serialized sklearn model (6KB)
├── requirements.txt    ← ROOT LEGACY: streamlit, pandas, numpy, scikit-learn, pytest, flake8
├── render.yaml         ← Render.com backend deploy config
├── ecosystem.config.cjs ← PM2 config (hardcoded Windows paths — not portable)
├── start-servers.bat   ← Windows-only launch script
├── start-backend.bat   ← Windows-only launch script
├── run-silent.vbs      ← Windows-only VBScript wrapper
├── README.md           (279 lines) ← Main README (has inaccuracies — see 0.5)
├── CONTRIBUTING.md     (30 lines)  ← Basic contributor guide
└── LICENSE             ← MIT
```

### ⚠️ Drift from Master Prompt Hypothesis

| Claim in Brief | Reality (verified) |
|---|---|
| `gemini-2.0-flash` model | **WRONG** — code uses `gemini-2.5-flash` in both `analyze_pdf_with_vision` and `analyze_report_with_gemini` |
| No `chart.js` or `recharts` confirmed | **CORRECT** — `recharts` is used (RadarChart in Dashboard, AreaChart in Report), no `chart.js` |
| `python-jose` is a dependency (suggesting JWT intent) | **WRONG** — `python-jose` is in requirements.txt but **never imported** anywhere in backend code |
| `aiofiles` is used | **WRONG** — listed in requirements.txt but not imported anywhere |
| `psycopg2-binary` used | **CORRECT** — needed for Postgres on Render even if SQLite is used locally |
| `HashRouter` confirmed | **CORRECT** — App.jsx uses `HashRouter` from `react-router-dom` |
| `chart.js` in package.json | **WRONG** — not in package.json; `recharts@3.8.1` is used |
| Frontend uses Tailwind CSS | **NOT in brief** — `tailwindcss@4.3.1` IS installed and active (vite plugin), not vanilla CSS |
| `jsPDF` not mentioned | **MISSING from brief** — `jspdf@4.2.1` used in `Report.jsx` for PDF downloads (issue #17 already solved!) |
| `jwt-decode` not mentioned | **MISSING from brief** — `jwt-decode@4.0.0` used in `AuthModal.jsx` to decode Google credential picture |
| `lucide-react` not mentioned | **MISSING** — used extensively across pages/components |
| CI/CD exists | **CORRECT** — `ci.yml` exists with 4 stages |
| `VITE_API_BASE_URL` env var name | **WRONG** — actual var is `VITE_API_URL` (different name, matters for env config docs) |
| `HEALTH_AI_API` env var name | **CONFIRMED in code** |
| `DATABASE_URL` env var | **CONFIRMED in database.py** |

---

## 0.2 Dependency Mapping

### Backend — Confirmed Usage vs. requirements.txt

| Package | In requirements.txt | Actually Imported | Notes |
|---------|-------------------|-------------------|-------|
| `fastapi` | ✅ | ✅ main.py | Core framework |
| `uvicorn[standard]` | ✅ | runtime | Start command |
| `sqlalchemy` | ✅ | ✅ database.py, models.py | ORM |
| `pydantic` | ✅ | ✅ schemas.py, main.py BaseModel | Validation |
| `python-multipart` | ✅ | ✅ (required for Form/File uploads) | |
| `python-jose[cryptography]` | ✅ | ❌ **NEVER IMPORTED** | Dead dep — JWT was planned but never built |
| `passlib[bcrypt]` | ✅ | ✅ main.py (pwd_context) | Password hashing |
| `python-dotenv` | ✅ | ✅ ai_service.py (load_dotenv) | |
| `google-generativeai` | ✅ | ✅ ai_service.py | Gemini SDK |
| `PyPDF2` | ✅ | ✅ ai_service.py | PDF text extraction |
| `google-auth` | ✅ | ✅ main.py (id_token verification) | Google OAuth backend verify |
| `requests` | ✅ | ✅ (google.auth.transport.requests) | |
| `httpx` | ✅ | ✅ main.py (async hospital finder), n8n_service.py | |
| `psycopg2-binary` | ✅ | runtime (Postgres adapter) | Needed on Render |
| `aiofiles` | ✅ | ❌ **NEVER IMPORTED** | Dead dep |

**⚠️ Dead dependencies:** `python-jose[cryptography]`, `aiofiles` — should be removed from `backend/requirements.txt`
**⚠️ No version pins** — all packages are unpinned (`fastapi`, `sqlalchemy`, etc.), which is a stability risk for production and GSSoC contributors who install at different times.
**⚠️ Missing from backend requirements:** `pdf2image` is imported inside `ai_service.py` (line 84) but NOT listed in `backend/requirements.txt`. The Vision analysis path will fail silently if a contributor doesn't have it installed. Also requires `poppler` system binary with a **hardcoded Windows path** (`C:\Users\prash\poppler\...`) — makes Vision analysis non-portable.

### Frontend — Confirmed Usage vs. package.json

**✅ All frontend dependencies are actually used.**

---

## 0.3 Architecture Reconstruction

### POST /upload_report — Confirmed Lifecycle

```
1. Client sends multipart/form-data: { file: PDF, user_id?: int }
2. backend reads file bytes (await file.read())
3. ai_service.extract_text_from_pdf(bytes) → extracted_text (PyPDF2)
4. Branch:
   A. user_id present AND user exists AND user has prior reports
      → ai_service.analyze_trend_with_gemini(historical_texts, extracted_text)
   B. user_id absent (anonymous) OR user has no prior reports
      → ai_service.analyze_report_with_gemini(extracted_text, pdf_bytes)
5. Saves Report row to DB
6. Fires n8n webhooks (non-blocking try/except):
   → trigger_report_saved() → always
   → trigger_high_risk_alert() → if risk_score >= 70.0
   → trigger_doctor_alert() → if risk_score >= 85.0
7. Returns full Report schema JSON
```

### AI Output JSON Schema — Schema vs Code vs DB Comparison

**✅ Schema is fully consistent across AI prompt → schemas.py → models.py.**

### All 10 Backend Endpoints — Confirmed

**🔴 Security: ALL data endpoints are completely unauthenticated.** Any client can read any user's reports via `/reports` or `/users/{id}/reports`. The `python-jose` JWT library is installed but never used.

### Frontend 8 Routes — Confirmed

All routes match `App.jsx`. Dashboard requires `tony_health_user` in localStorage.

---

## 0.4 Quality & Risk Audit

### 🔴 CRITICAL Findings

**C1 — No Authentication on Data Endpoints**
- ALL report endpoints (`/reports`, `/reports/{id}`, `/users/{id}/reports`) are publicly accessible without any token.

**C2 — Google Client ID Committed in Frontend .env**
- `frontend/.env` contains `VITE_GOOGLE_CLIENT_ID` which is committed to the repo.

**C3 — SQLite Database Committed to Repo**
- `backend/tonyhealth.db` is committed. May contain PII.

**C4 — Hardcoded Windows Path in ai_service.py**
- `POPPLER_PATH = r"C:\Users\prash\poppler\poppler-24.08.0\Library\bin"` (line 13)

**C5 — `pdf2image` Missing from requirements.txt**
- Imported on line 84 of `ai_service.py` but not in `backend/requirements.txt`.

### 🟡 HIGH Findings

**H1 — CI Pipeline Will Fail**
- `backend-test` runs `pytest`, but `main.py` needs `n8n_service` etc. `ml-model-test` runs `test_model.py` which depends on the committed `heart_model.pkl`. Frontend `npm run test` is missing from package.json scripts.

**H2 — Dashboard Mock Data**
- `Dashboard.jsx` contains hardcoded mock data for radar chart, goals, appointments, and history.

**H3 — LandingPage nav links point to `/analysis`**
- Placeholders that go to the wrong page.

**H4 — n8n PII Concern**
- Webhooks send detailed health analysis. No safeguard document exists explaining what data leaves the system.

**H5 — ecosystem.config.cjs Has Hardcoded Absolute Paths**
- Paths `C:\Users\prash\...` make this file non-portable.

### 🟠 MEDIUM Findings

**M1 — Issue #17 "Add Download Report feature" — ALREADY IMPLEMENTED**
**M2 — Issue #24 "Add Loading Spinner" — ALREADY PARTIALLY IMPLEMENTED**
**M3 — No input validation on /upload_report**
**M4 — LandingPage.jsx is 581 lines** (too many concerns)
**M5 — Duplicate test files**
**M6 — No `.gitignore` entry for `tonyhealth.db`**

### 🟢 LOW / NICE-TO-HAVE

**L1 — Inline BaseModel classes in main.py**
**L2 — No version pins in backend requirements**
**L3 — ecosystem.config.cjs runs Vite dev server via PM2**

---

## 0.5 Existing Documentation Audit

README.md has inaccuracies (gemini-1.5-flash vs 2.5-flash, env var names, dead streamlit app shown in arch diagram). CONTRIBUTING.md is minimal. frontend/README.md is vite boilerplate.

---

## 0.6 GSSoC Issues Status vs. Code Reality

Some issues are partially or fully done (#17, #24). Others remain open as stated.

---

## Prioritized Improvement List

See Critical/High/Medium/Low tags above. All will be addressed in Phase 1 plan.
