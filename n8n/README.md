# 🔄 n8n Automation — Heart AI System

This folder contains the **n8n workflow** that powers the Heart AI System's automation layer — including high-risk patient alerts, doctor notifications, and report logging.

---

## 📦 What's Included

| File | Purpose |
|---|---|
| `heart-ai-workflows.json` | n8n workflow — import this into your n8n instance |

---

## 🚀 Workflows Inside

### 1. 📋 Report Saved Logger
- **Trigger:** Every new report saved
- **Action:** Logs patient data to **Google Sheets**
- **Webhook path:** `POST /webhook/heart-ai/report-saved`

### 2. 🚨 High Risk Alert (Risk Score ≥ 70)
- **Trigger:** Report with high risk score
- **Action:** Sends **Email** + **Telegram** alert
- **Webhook path:** `POST /webhook/heart-ai/high-risk-alert`

### 3. 🔴 Doctor Alert (Risk Score ≥ 85)
- **Trigger:** Critical risk patient report
- **Action:** Sends detailed **Doctor Email** with full report summary
- **Webhook path:** `POST /webhook/heart-ai/doctor-alert`

---

## ⚡ Quick Setup

### Step 1 — Start n8n locally
```bash
# With Docker (recommended)
docker run -it --rm --name n8n -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or with npx
npx n8n
```

Open → [http://localhost:5678](http://localhost:5678)

---

### Step 2 — Import the Workflow
1. Open n8n → click **Workflows** → **Import from File**
2. Select `n8n/heart-ai-workflows.json`
3. Click **Import**

---

### Step 3 — Configure Credentials in n8n
Inside n8n, set up:

| Service | Where to configure |
|---|---|
| **Gmail / SMTP** | n8n → Credentials → Email (SMTP) |
| **Telegram Bot** | n8n → Credentials → Telegram API |
| **Google Sheets** | n8n → Credentials → Google Sheets OAuth2 |

> **Telegram Setup:** Create a bot via [@BotFather](https://t.me/BotFather) and get your `chat_id`.

---

### Step 4 — Configure the Backend
Add these to your `backend/.env`:

```env
N8N_BASE_URL=http://localhost:5678
N8N_HIGH_RISK_WEBHOOK=http://localhost:5678/webhook/heart-ai/high-risk-alert
N8N_REPORT_SAVED_WEBHOOK=http://localhost:5678/webhook/heart-ai/report-saved
N8N_DOCTOR_ALERT_WEBHOOK=http://localhost:5678/webhook/heart-ai/doctor-alert

HIGH_RISK_THRESHOLD=70.0
CRITICAL_RISK_THRESHOLD=85.0
DOCTOR_EMAIL=doctor@hospital.com
```

---

### Step 5 — Activate Workflows in n8n
1. Open each imported workflow
2. Click the **Active** toggle (top right)
3. n8n will now listen for webhooks from the backend ✅

---

## 🏗️ Architecture

```
Patient uploads PDF
      ↓
Backend analyzes with Gemini AI
      ↓
Report saved to DB
      ↓ (async, non-blocking)
n8n_service.process_report_webhooks()
      ├── /webhook/heart-ai/report-saved   → Google Sheets log
      ├── /webhook/heart-ai/high-risk-alert → Email + Telegram (if risk ≥ 70)
      └── /webhook/heart-ai/doctor-alert   → Doctor Email (if risk ≥ 85)
```

---

## 🌐 Production Deployment

For production, deploy n8n on a server or use **[n8n Cloud](https://app.n8n.cloud)**:

```env
# Update in backend/.env
N8N_BASE_URL=https://your-n8n-instance.app.n8n.cloud
```

---

## 🤝 Contributing (GSSoC 2026)

Want to add more workflows? Some ideas:
- WhatsApp alerts via Twilio
- Notion database logging
- Slack channel notifications
- Weekly patient summary report (scheduled)
