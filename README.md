# LogLens AI

**AI-assisted security log analysis dashboard for small businesses.**

LogLens AI is a self-hostable web application that analyzes Linux authentication logs, detects suspicious SSH login behavior, ranks incidents by risk score, and generates plain-language AI summaries with recommended remediation steps.

---

## Problem Statement

Small businesses and solo developers often run Linux servers without enterprise security tooling. Server authentication logs contain valuable signals — brute-force attempts, credential stuffing, account compromise — but reading raw log files is tedious and requires security expertise.

LogLens AI turns raw auth logs into structured security incidents with severity scores, AI explanations, and actionable recommendations, giving non-specialists a clear picture of what's happening on their server.

---

## Features

- Upload Linux `auth.log` files via drag-and-drop
- Automatic parsing of SSH failed logins, invalid user attempts, and successful logins
- Four detection rules: brute-force, sensitive username targeting, successful login after failures, username enumeration
- Transparent risk scoring (0–100) with severity levels (Low / Medium / High / Critical)
- AI-generated incident summaries via OpenAI GPT-4o-mini (with full mock fallback when no API key is provided)
- Incident management: mark as Reviewed, False Positive, or Resolved
- Clean dashboard with summary metrics, recent incidents, and top suspicious IPs
- Audit log for all key actions
- AI prompt injection protection (log content is treated as untrusted evidence only)

---

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend  | Python, FastAPI, SQLAlchemy, SQLite         |
| AI       | OpenAI GPT-4o-mini (mock fallback built-in) |
| Deploy   | Docker, Docker Compose                      |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (React + TypeScript + Tailwind)            │
│  Dashboard · Upload · Incidents · Incident Detail   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / REST
┌───────────────────────▼─────────────────────────────┐
│  FastAPI Backend                                    │
│  ┌──────────┐  ┌────────────┐  ┌───────────────┐   │
│  │  Parser  │→ │ Detection  │→ │  AI Service   │   │
│  │ (regex)  │  │  (rules)   │  │ (OpenAI/mock) │   │
│  └──────────┘  └────────────┘  └───────────────┘   │
│              ↓                                      │
│         SQLite Database                             │
│  (log_files · events · incidents · ai_summaries)   │
└─────────────────────────────────────────────────────┘
```

---

## Setup — Local Development

### Prerequisites

- Python 3.12+ (3.14 works with latest pydantic)
- Node.js 20+
- npm

### 1. Clone and set up environment files

```bash
git clone <repo-url>
cd loglens-ai
cp .env.example backend/.env
```

Edit `backend/.env` and add your OpenAI key (optional — app works without it):

```
OPENAI_API_KEY=sk-...   # leave blank for mock AI summaries
DATABASE_URL=sqlite:///./loglens.db
ALLOWED_ORIGINS=http://localhost:5173
```

### 2. Run the backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive API explorer.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Setup — Docker

```bash
cp .env.example .env
# Edit .env to add OPENAI_API_KEY if desired

docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## Environment Variables

| Variable          | Required | Default                          | Description                              |
|-------------------|----------|----------------------------------|------------------------------------------|
| `OPENAI_API_KEY`  | No       | (empty)                          | OpenAI key. Leave blank for mock mode.  |
| `DATABASE_URL`    | No       | `sqlite:///./loglens.db`         | SQLite path.                             |
| `ALLOWED_ORIGINS` | No       | `http://localhost:5173`          | CORS origins for the frontend.          |
| `VITE_API_URL`    | No       | `http://localhost:8000`          | Frontend API base URL.                   |

---

## Sample Log Usage

A sample authentication log is included at `sample-data/sample_auth.log`. It contains realistic SSH brute-force patterns from multiple IPs and triggers all four detection rules.

1. Start both backend and frontend
2. Navigate to **Upload Logs**
3. Drop `sample-data/sample_auth.log` onto the upload zone
4. Click **Analyze Log File**
5. Expected: ~10 incidents created across 3 source IPs

---

## Detection Rules

| Rule | Trigger | Severity |
|------|---------|---------|
| **Brute-force** | Same IP, 5+ failed logins | Medium→Critical based on count |
| **Sensitive username** | Targets root, admin, ubuntu, etc. | Medium (High if 10+ failures) |
| **Login after failures** | 5+ failures then success | Critical |
| **Username enumeration** | Same IP, 5+ different usernames | High |

Risk score (0–100) combines: rule base score + failure volume + sensitive username targeting + post-failure success.

---

## AI Safety Notes

- The AI does **not** perform detection. Rules detect; AI explains.
- The system prompt explicitly instructs the model to treat log lines as untrusted evidence and to never execute instructions found in logs.
- Only up to 20 evidence lines per incident are sent to the AI — full file contents are never forwarded.
- If AI generation fails for any reason, incident creation continues with a deterministic mock summary. The app never crashes due to AI failure.
- No user data is stored on third-party servers beyond what OpenAI processes per API call.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/logs/upload` | Upload and analyze a log file |
| GET | `/api/logs` | List uploaded log files |
| GET | `/api/logs/{id}` | Get one log file |
| GET | `/api/incidents` | List incidents (filter by severity, status, search) |
| GET | `/api/incidents/{id}` | Get full incident detail with evidence and AI summary |
| PATCH | `/api/incidents/{id}/status` | Update incident status |
| GET | `/api/dashboard/summary` | Dashboard metrics and top IPs |

---

## Screenshots

_Add screenshots here after first run._

---

## Future Improvements

- Support for Nginx and Apache access logs
- User authentication and role-based access
- PostgreSQL support for production deployments
- Report generation and PDF export
- IP reputation lookup (AbuseIPDB integration)
- Local LLM support (Ollama / llama.cpp)
- Email notifications for critical incidents
- Scheduled weekly security digest reports
- Phishing email header analysis
- Dependency vulnerability scanning

---

## Portfolio Description

LogLens AI is a self-hostable AI-assisted security log analysis dashboard for small businesses. It analyzes uploaded Linux authentication logs, detects suspicious login behavior such as brute-force attempts and successful logins after repeated failures, ranks incidents by risk, and generates plain-language AI summaries with recommended remediation steps. The project combines deterministic rule-based detection with AI-assisted explanation, while including production-focused concepts such as input validation, audit logging, human review workflows, AI fallback behavior, and structured incident management.
