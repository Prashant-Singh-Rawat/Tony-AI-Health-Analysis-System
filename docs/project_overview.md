# Project Overview: Tony Health Analysis System

The **Tony Health Analysis System** is an advanced medical report parsing and patient management ecosystem. It enables patients to upload diverse medical reports (e.g., blood tests, CBC, liver/kidney function, general wellness logs) as PDFs or images, translates these artifacts into structured digital records using AI, assesses patient health risk metrics, provides personal health guidance, and routes notifications/alerts through custom n8n workflow integrations.

---

## Folder Documentation

Below is the layout of the project's codebase, detailing the purpose of major files and directories:

### Root Level
*   `backend/` - The FastAPI server codebase, containing API controllers, database schemas, ORM models, and the AI service layers.
*   `frontend/` - React frontend powered by Vite and styled with Tailwind CSS v4.
*   `n8n/` - Home to automated workflow exports and setup instructions.
*   `docs/` - System architecture blueprints, sequence diagrams, and API guides.
*   `legacy/` - Unused code or initial prototype structures kept for historical context.
*   `render.yaml` - Configuration script for deploying the backend service on Render.com.
*   `ecosystem.config.cjs` - PM2 process manager configuration (for running backend/frontend servers concurrently).
*   `start-servers.bat`, `start-backend.bat`, `run-silent.vbs` - Execution scripts for local setup on Windows environments.

### Backend (`/backend`)
*   `main.py` - Core entry point defining REST controllers, auth rules, OSM hospital calculations, and webhook dispatching.
*   `ai_service.py` - Core Gemini SDK interface handling digital PDF text parsing and visual PDF page rendering using PIL images.
*   `database.py` - Manages SQLAlchemy engine connections, supporting Postgres (production) and SQLite (local dev).
*   `models.py` - Database table definitions (ORM models) mapping the `User` and `Report` tables.
*   `schemas.py` - Pydantic model schemas enforcing input/output validation, request shapes, and serialization types.
*   `n8n_service.py` - Client driver communicating with n8n workflow webhooks depending on patient risk thresholds.
*   `requirements.txt` - Lists pip package dependencies.

### Frontend (`/frontend`)
*   `src/main.jsx` - Mounts the React application and configures Google OAuth wrapper.
*   `src/App.jsx` - Sets up page routing via HashRouter.
*   `src/components/` - Shared UI elements:
    *   `MainNav.jsx` - Main header navigation with integrated hospital finder dropdowns.
    *   `AuthModal.jsx` - Handles register/login views and Google sign-in interfaces.
*   `src/pages/` - Core page layouts:
    *   `LandingPage.jsx` - Primary promotional screen, FAQ sections, and chatbot.
    *   `Dashboard.jsx` - Patient workspace displaying historic reports, health indicators, goals, and radar maps.
    *   `Analysis.jsx` - File drag-and-drop ingestion interface and inline results visualizer.
    *   `Report.jsx` - Renders full patient health details and generates customized jsPDF prints.
    *   `HospitalFinder.jsx` - Location-aware maps listing coordinates and distances to nearby clinics.
    *   `MedicinePrices.jsx` - Directory looking up comparative drug pricing options.
    *   `Services.jsx` - Service options catalog index.
    *   `PatientCorner.jsx` - User-centric resources and knowledgebase repository.
*   `src/services/api.js` - Centralized Axios instance incorporating Bearer token headers.

---

## Dependencies & Core Environment Setup

### Backend Core Dependencies
*   `fastapi` & `uvicorn` - High-performance ASGI framework and web server.
*   `sqlalchemy` - Database Object-Relational Mapper.
*   `google-genai` - Unified Google client library for accessing Gemini models.
*   `pdf2image` & `PyPDF2` - Tools converting and extracting PDF documents.
*   `passlib[bcrypt]` - Cryptographic password hashing.

### Frontend Core Dependencies
*   `react` & `react-dom` (v19) - User interface construction.
*   `react-router-dom` - Navigation routes.
*   `recharts` - Renders interactive health analytics dashboards.
*   `@react-oauth/google` - Configures Google Identity services authentication.
*   `tailwindcss` (v4) - CSS styling.
*   `jspdf` - Compiles printable patient summaries.
