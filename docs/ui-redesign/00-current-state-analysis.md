# Phase 0 — Discovery: Current State of the Analysis Page

## 1. Code & State Analysis of `Analysis.jsx`
- **State:** Currently holds three pieces of state: `file` (the selected PDF), `loading` (boolean for submission state), and `error` (string for UI error messages).
- **API Call:** Uses `apiService.uploadReport(file, user?.id)` which maps to `POST /upload_report` on the backend. This relies on an Axios interceptor that injects the JWT if the user is authenticated.
- **Routing & Navigation:** `Analysis.jsx` is mounted at `/analysis` in `App.jsx`. It's reached via multiple links across `LandingPage.jsx`, `MainNav.jsx`, and `Dashboard.jsx`.
- **Conditional Branching / Auth:** Authentication is evaluated by reading `tony_health_user` from `localStorage` inside the `getUser()` helper. If the user is logged in, their `user.id` is appended to the FormData, allowing the backend to associate the report and trigger the trend-analysis logic. If anonymous, it's sent without a `user_id`.
- **Post-Upload Behavior:** Upon a successful upload, `Analysis.jsx` **does not** render the data itself. Instead, it navigates the user to `/report/${data.id}` (which is handled by `Report.jsx`), relying on the `Report` page to display the results.

## 2. Data Shape Validation
Currently, `Analysis.jsx` ignores the actual response data shape (other than `data.id` for routing). However, validating the backend `schemas.Report` and `models.Report`, the full data contract is:
- `patient_name` (string)
- `patient_age` (string)
- `disease_type` (string)
- `risk_score` (float, 0-100)
- `concerns` (string/text)
- `exercise_plan` (string/text)
- `food_plan` (string/text)
- `overall_status` (string, e.g., "High Risk", "Improving")
- `extracted_parameters` (list of dictionaries representing test parameters)
- `potential_diseases` (list of strings)

## 3. Current Styling & Architecture
- **Styling:** The app uses Tailwind CSS heavily (via utility classes on raw HTML elements). There is no distinct UI component library (like MUI or Radix) in use for the forms.
- **Loading/Error States:** Loading is handled via a simple `lucide-react` `Loader2` spinner on the submit button. Errors are caught in a try/catch block and rendered in a small red alert box above the form. There is no skeleton loading or granular progress updates.
- **Responsiveness & Accessibility:** The current form is responsive (centered max-w-2xl container), but lacks deep accessibility compliance (e.g., proper aria-labels on the drag-and-drop zone).
- **Empty States:** The upload box itself acts as an empty state, but there is no context given to returning users about their history directly on the `Analysis.jsx` page.

## 4. Gap List (Current vs Target Redesign)

| Target Requirement | Current State | Gap to Address |
| --- | --- | --- |
| **Unified Dashboard Experience** | Page only handles file upload and redirects. | Needs to act as an orchestrator that stays on `/analysis` and renders the extracted results (or integrates deeply with `Report.jsx`). *Decision needed: Should we merge `Report.jsx` into `Analysis.jsx` or just render the immediate upload response on `Analysis.jsx`?* |
| **Upload & Preview** | Basic hidden file input inside a dashed box. | Needs drag-and-drop mechanics, file preview, and a multi-step progress UI. |
| **AI Analysis Loading State** | Button spinner ("Analyzing with AI..."). | Needs staged loading messaging ("Extracting report text", "Analyzing with AI", "Calculating risk score"). |
| **Diagnosis, Risk Gauge, Parameters** | Not present on `Analysis.jsx` (handled in `Report.jsx`). | Needs to be designed and implemented within the new multi-section dashboard view as requested. |
| **Feature Cards & Navigation** | Only a "Cancel" link back to Dashboard. | Needs a localized section sidebar/tabs, breadcrumbs, and feature cards linking to other real pages (`PatientCorner`, `HospitalFinder`, etc.). |
| **Design Tokens & Accessibility** | Ad-hoc Tailwind utility classes. | Needs a structured token system (calming medical colors, semantic risk colors: Low/Mod/High/Critical) applied consistently, with focus states and aria attributes. |
