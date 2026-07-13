# Production Reliability Guide — Render Free Plan Sleep Behavior

This document outlines the hosting environment limitations on the Render Free plan and provides guidance on how to manage and optimize production reliability.

## Render Free Tier Sleeping Policy

The backend for this system is hosted on the Render Free plan. Render automatically suspends (spins down) web services that run on a free instance if they experience **15 minutes of inactivity** (no inbound HTTP requests).

### Impact on User Experience
- When a user uploads a medical report after a period of inactivity, the frontend API call triggers a backend "cold start".
- Render spins up a new instance, which takes **40 to 50 seconds** to fully boot, initialize the database connection, and begin listening for requests.
- If the frontend does not expect this delay, it can trigger client-side timeouts or appear to hang.

---

## Graceful Recovery Design

To deliver a premium experience even on a free hosting tier, the Heart AI System implements the following:
1. **Dynamic Wake-up Indicator**: If an analysis upload request takes longer than 6 seconds, the loading screen transitions to display a helpful message:
   > "Backend is waking up from standby. The first request can take up to 50 seconds on the Render free plan. Please wait..."
2. **Analysis Permanence**: Analysis outputs (including generated doctor questions and action items) are saved permanently to the database. Refreshes load from database storage, avoiding redundant LLM requests.
3. **60-Second Client Timeout**: The API client timeout is set to 60 seconds to ensure the connection is held open during the cold start.
4. **Retry on Error**: A direct "Retry Analysis" button is rendered on the error container to make recovery single-click.

---

## Long-term Keep-Alive Recommendations

To avoid cold starts entirely and keep the backend alive 24/7, choose one of the following approaches:

### 1. Upgrade Render Instance (Recommended)
Upgrading the Render backend service from the **Free** tier to a **Starter** or higher paid instance type ensures the instance is "Always On".
- **Cost**: Starts at $7/month (standard Render web service rates).
- **Benefit**: 0-second latency, zero cold starts, and immediate response times.

### 2. Configure Uptime Monitoring (Free/Low-Cost Temporary Patch)
You can configure a free uptime monitoring service (such as [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) to ping the backend health-check route at regular intervals.
- **Target URL**: `https://your-backend-url.onrender.com/health`
- **Interval**: Every **5 to 10 minutes** (must be less than the 15-minute Render inactivity window).
- **Benefit**: Forces the container to remain warm during active hours.
