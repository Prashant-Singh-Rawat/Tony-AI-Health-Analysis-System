# n8n Automation Workflow Architecture

This document defines all 10 automation workflows, their webhook paths, trigger conditions, payloads, and target actions.

---

## Webhook Architecture Overview

```mermaid
graph LR
    subgraph Backend FastAPI
        A1[POST /auth/register] -->|user_registered| W4
        A2[POST /upload_report] -->|report_saved| W1
        A2 -->|risk >= 70| W2
        A2 -->|risk >= 85| W3
        A2 -->|risk >= 95| W10
        A3[Scheduled Job] -->|daily| W5
        A3 -->|daily 7am| W6
        A3 -->|daily 8am 1pm| W7
        A3 -->|every Sunday| W8
        A3 -->|24h before appt| W9
    end

    subgraph n8n Webhook Server
        W1[/webhook/heart-ai/report-saved]
        W2[/webhook/heart-ai/high-risk-alert]
        W3[/webhook/heart-ai/doctor-alert]
        W4[/webhook/heart-ai/user-registered]
        W5[/webhook/heart-ai/medicine-reminder]
        W6[/webhook/heart-ai/workout-reminder]
        W7[/webhook/heart-ai/diet-reminder]
        W8[/webhook/heart-ai/weekly-summary]
        W9[/webhook/heart-ai/appointment-reminder]
        W10[/webhook/heart-ai/emergency-alert]
    end

    subgraph Action Layer
        W1 --> Sheets[Google Sheets Log]
        W2 --> Email[SMTP Email]
        W2 --> Tg[Telegram Bot]
        W3 --> DocEmail[Doctor Email]
        W4 --> Welcome[Welcome Email]
        W5 --> MedPush[Push / Email]
        W6 --> WorkoutEmail[Exercise Email]
        W7 --> DietEmail[Diet Email]
        W8 --> SummaryEmail[Weekly Digest Email]
        W9 --> ApptEmail[Reminder Email / SMS]
        W10 --> SMS[Twilio SMS]
        W10 --> Call[Emergency Call]
        W10 --> DocEmail
    end
```

---

## Workflow Specifications

### 1. Report Saved Logger
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/report-saved` |
| **Trigger** | Every new health report uploaded |
| **Actions** | Append row to Google Sheets |
| **Payload Fields** | `report_id`, `patient_name`, `patient_age`, `disease_type`, `risk_score`, `overall_status`, `timestamp`, `pdf_filename` |

---

### 2. High Risk Alert
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/high-risk-alert` |
| **Trigger** | `risk_score >= 70` |
| **Actions** | Email alert to patient + Telegram notification |
| **Payload Fields** | `report_id`, `patient_name`, `risk_score`, `risk_level`, `disease_type`, `concerns`, `exercise_plan`, `food_plan` |

---

### 3. Doctor Alert
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/doctor-alert` |
| **Trigger** | `risk_score >= 85` |
| **Actions** | Detailed PDF summary emailed to assigned doctor |
| **Payload Fields** | `report_id`, `patient_name`, `patient_age`, `risk_score`, `disease_type`, `concerns`, `potential_diseases`, `doctor_email` |

---

### 4. User Registration
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/user-registered` |
| **Trigger** | New account created (email or Google OAuth) |
| **Actions** | Welcome email with onboarding instructions |
| **Payload Fields** | `user_id`, `name`, `email`, `created_at`, `auth_type` |

---

### 5. Medicine Reminder
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/medicine-reminder` |
| **Trigger** | Daily scheduled job (configured in n8n cron) |
| **Actions** | Push notification + email to patient |
| **Payload Fields** | `user_id`, `patient_name`, `email`, `medicines[]` |

---

### 6. Workout Reminder
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/workout-reminder` |
| **Trigger** | Daily at 7:00 AM |
| **Actions** | Motivational email with AI-generated exercise plan |
| **Payload Fields** | `user_id`, `patient_name`, `email`, `exercise_plan` |

---

### 7. Diet Reminder
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/diet-reminder` |
| **Trigger** | Daily at 8:00 AM and 1:00 PM |
| **Actions** | Email/push with personalized meal guidance |
| **Payload Fields** | `user_id`, `patient_name`, `email`, `food_plan` |

---

### 8. Weekly Health Summary
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/weekly-summary` |
| **Trigger** | Every Sunday |
| **Actions** | Digest email with trend, average risk score, and concerns |
| **Payload Fields** | `user_id`, `patient_name`, `email`, `week_start`, `week_end`, `avg_risk_score`, `trend`, `reports_this_week`, `top_concerns[]` |

---

### 9. Appointment Reminder
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/appointment-reminder` |
| **Trigger** | 24 hours before a scheduled visit |
| **Actions** | Email + optional SMS notification to patient |
| **Payload Fields** | `user_id`, `patient_name`, `email`, `doctor_name`, `specialty`, `date`, `time`, `location` |

---

### 10. Emergency Alert
| Property | Value |
|---|---|
| **Webhook Path** | `POST /webhook/heart-ai/emergency-alert` |
| **Trigger** | `risk_score >= 95` (critical threshold) |
| **Actions** | Twilio SMS + automated call + doctor email |
| **Payload Fields** | `report_id`, `patient_name`, `patient_age`, `risk_score`, `disease_type`, `concerns`, `emergency_contacts[]`, `doctor_email` |

---

## Environment Variables Reference

```env
N8N_BASE_URL=http://localhost:5678

# Core Webhooks
N8N_REPORT_SAVED_WEBHOOK=http://localhost:5678/webhook/heart-ai/report-saved
N8N_HIGH_RISK_WEBHOOK=http://localhost:5678/webhook/heart-ai/high-risk-alert
N8N_DOCTOR_ALERT_WEBHOOK=http://localhost:5678/webhook/heart-ai/doctor-alert

# Lifecycle Webhooks
N8N_USER_REGISTERED_WEBHOOK=http://localhost:5678/webhook/heart-ai/user-registered
N8N_MEDICINE_REMINDER_WEBHOOK=http://localhost:5678/webhook/heart-ai/medicine-reminder
N8N_WORKOUT_REMINDER_WEBHOOK=http://localhost:5678/webhook/heart-ai/workout-reminder
N8N_DIET_REMINDER_WEBHOOK=http://localhost:5678/webhook/heart-ai/diet-reminder
N8N_WEEKLY_SUMMARY_WEBHOOK=http://localhost:5678/webhook/heart-ai/weekly-summary
N8N_APPOINTMENT_WEBHOOK=http://localhost:5678/webhook/heart-ai/appointment-reminder
N8N_EMERGENCY_ALERT_WEBHOOK=http://localhost:5678/webhook/heart-ai/emergency-alert

# Thresholds
HIGH_RISK_THRESHOLD=70.0
CRITICAL_RISK_THRESHOLD=85.0
DOCTOR_EMAIL=doctor@hospital.com
```
