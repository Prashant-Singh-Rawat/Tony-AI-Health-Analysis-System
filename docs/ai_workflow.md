# AI Workflow and n8n Webhook Integration

This document outlines how medical documents are ingested, analyzed using Gemini, and routed to automation workflows.

---

## 1. Document Processing & Gemini Integration

The analysis engine (`backend/ai_service.py`) handles digital and scanned PDF inputs:

```mermaid
flowchart TD
    A[Upload Request] --> B{Does PDF have digital text?}
    B -->|Yes| C[Extract text with PyPDF2]
    B -->|No/Short| D[pdf2image: Render pages to high-DPI images]
    C --> E[Submit text content to Gemini client]
    D --> F[Submit PIL Images to Gemini client]
    E & F --> G[client.models.generate_content]
    G --> H[Parse response text as JSON]
    H --> I[Store to Database]
```

### Prompt Engineering and Structured Output
The prompt constraints Gemini to return structured JSON adhering to the following schema:
```json
{
  "patient_name": "string or null",
  "patient_age": "string or null",
  "extracted_parameters": [
    {
      "name": "string",
      "value": "number or string",
      "unit": "string",
      "reference_interval": "string",
      "status": "normal | high | low | abnormal"
    }
  ],
  "disease_type": "string",
  "risk_score": 0.0,
  "potential_diseases": ["string"],
  "concerns": "string",
  "exercise_plan": "string",
  "food_plan": "string",
  "overall_status": "High Risk | Moderate Risk | Low Risk | Improving | Worsening"
}
```

---

## 2. n8n Automation Workflows

Once reports are verified and saved in the database, `n8n_service.py` runs asynchronous, non-blocking webhook requests to an n8n instances.

```mermaid
sequenceDiagram
    autonumber
    participant Server as FastAPI Server
    participant Service as n8n_service.py
    participant Webhook as n8n Webhooks
    participant Actions as Automation Actions (Sheets, Email, Telegram)

    Server->>Service: process_report_webhooks(report_data)
    
    rect rgb(240, 240, 255)
        Note over Service, Webhook: Report Saved Logging
        Service->>Webhook: POST /webhook/heart-ai/report-saved
        Webhook->>Actions: Write row to Google Sheets
    end
    
    rect rgb(255, 240, 240)
        Note over Service, Webhook: High Risk Check (Risk >= 70)
        alt Risk Score >= 70
            Service->>Webhook: POST /webhook/heart-ai/high-risk-alert
            Webhook->>Actions: Send Email & Telegram Notification
        end
    end

    rect rgb(255, 220, 220)
        Note over Service, Webhook: Critical Risk Doctor Alert (Risk >= 85)
        alt Risk Score >= 85
            Service->>Webhook: POST /webhook/heart-ai/doctor-alert
            Webhook->>Actions: Email Doctor with full PDF analysis summary
        end
    end
```

### Environment Configurations:
*   `N8N_BASE_URL`: Base address of n8n server.
*   `N8N_HIGH_RISK_WEBHOOK`: Endpoint path for high-risk patients.
*   `N8N_REPORT_SAVED_WEBHOOK`: Endpoint logging records.
*   `N8N_DOCTOR_ALERT_WEBHOOK`: Endpoint for notifying doctors.
*   `HIGH_RISK_THRESHOLD` (Default: `70.0`)
*   `CRITICAL_RISK_THRESHOLD` (Default: `85.0`)
*   `DOCTOR_EMAIL`: Recipient doctor email.
