# Component Documentation: Tony Health Frontend

This document outlines the React pages, UI components, states, and client services powering the Tony Health application.

---

## 1. Page Elements & Views

### `LandingPage.jsx`
*   **Purpose:** The entry point for guest users.
*   **Key Sections:**
    *   **Hero Section:** Highlights AI analytics capabilities.
    *   **Features Overview:** Promotes hospital finder, pricing check, and diagnostic support.
    *   **Interactive Chatbot:** Simple mock chatbot answering common questions about heart health.
    *   **FAQ/Accordion Component:** Collapsible explanations of how reports are processed and secure handling.

### `Dashboard.jsx`
*   **Purpose:** The main workspace for logged-in patients.
*   **Visualizations:**
    *   **Historical Trends:** Area charts tracking health risk scores over time.
    *   **Radar Chart:** A multi-dimensional health breakdown across biological subsystems (Cardiac, Metabolic, Respiratory).
    *   **Report Ledger:** Lists and connects to specific historical uploads.
    *   **Goals & Appointments:** Tracks daily water intake, exercise, and upcoming followups.

### `Analysis.jsx`
*   **Purpose:** Ingests medical reports.
*   **Interface:**
    *   **Drag & Drop File Ingestor:** Handles PDF drops.
    *   **Inline Results Panel:** Once analysis completes, displays a risk gauge, parameter table with high/low/normal indicators, and lifestyle recommendations (exercise, diet).

### `HospitalFinder.jsx`
*   **Purpose:** Uses browser geolocation to fetch nearby emergency clinics and hospitals.
*   **Key Operations:**
    *   Requests browser geolocation permissions.
    *   Flashes status loaders (`idle`, `requesting`, `found`, `denied`).
    *   Dispatches coordinates to `/nearby-hospitals` and sorts findings by distance.

---

## 2. Core UI Components

### `MainNav.jsx`
*   **Purpose:** Persistent global header.
*   **Features:**
    *   Adaptive links (Home, Services, Hospitals, Prices).
    *   Auth trigger buttons.
    *   Dropdown listings for quick profile navigation.

### `AuthModal.jsx`
*   **Purpose:** Unified login/register modal window.
*   **Integrations:**
    *   Username/Password forms.
    *   **Google Authenticator Wrapper:** Wraps the `@react-oauth/google` buttons, capturing successful callbacks and forwarding them to backend endpoints.

---

## 3. Client State & Storage

### Authentication State
*   Stored locally in `localStorage` under key `tony_health_user`.
*   Includes JSON properties: `id`, `email`, `name`, `token`, `google_id`.
*   Attached to every outgoing HTTP request via Axios Interceptors in `frontend/src/services/api.js`.

### Missing Import Warning
> [!WARNING]
> `frontend/src/pages/Analysis.jsx` references `<ChevronRight />` without importing it from `lucide-react`. Ensure this is addressed during code refinement to avoid rendering crashes.
