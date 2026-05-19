# AI Idea Authenticity & Innovation Platform

## Project Description

AI Idea Authenticity & Innovation Platform is a full-stack hackathon and startup validation product. Users can submit an idea, compare it against a semantic reference corpus, review innovation insights, and explore results in a modern dashboard.

The application supports:

- idea similarity detection
- innovation scoring
- startup and judging analysis
- idea registration
- ownership certificate generation
- community idea exploration

## Features

- Sentence Transformers powered similarity detection using `all-MiniLM-L6-v2`
- FAISS vector search for top similar idea retrieval
- copy-risk warning based on semantic overlap
- innovation analytics dashboard with Recharts
- AI-guided suggestion generation
- startup potential and hackathon judging insights
- JWT authentication
- PDF certificate generation with ReportLab
- public community idea feed

## Project Structure

```text
project-root/
├── backend/
├── frontend/
├── dataset/
├── docker/
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 20+
- npm
- PostgreSQL
- Docker Desktop (optional)

### Environment Files

Backend:

1. Copy [backend/.env.example](C:\Programs\codex\AI Idea Similarity Detector\backend\.env.example) to `backend/.env`
2. Set `DATABASE_URL` for your local PostgreSQL instance

Frontend:

1. Copy [frontend/.env.local.example](C:\Programs\codex\AI Idea Similarity Detector\frontend\.env.local.example) to `frontend/.env.local`
2. Keep `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` for local development

## Running the Backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a PostgreSQL database named `idea_platform`, then run:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:

- `http://localhost:8000`
- `http://localhost:8000/docs`

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:3000`

## Running with Docker

From the project root:

```bash
docker-compose up --build
```

This starts:

- frontend on `http://localhost:3000`
- backend on `http://localhost:8000`
- postgres on `localhost:5432`

Stop services:

```bash
docker-compose down
```

## API Endpoints

Base prefix: `/api`

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`

Core idea endpoints:

- `POST /api/analyze-idea`
- `POST /api/generate-suggestions`
- `POST /api/register-idea`
- `GET /api/similar-ideas`
- `GET /api/analytics`

Additional routes:

- `GET /api/community`
- `PUT /api/ideas/{idea_id}`
- `GET /api/ideas/{idea_id}/workspace`
- `POST /api/ideas/{idea_id}/notes`
- `GET /api/ideas/{idea_id}/certificate`

## AI Engine Notes

The AI engine lives in:

- [embedding_model.py](C:\Programs\codex\AI Idea Similarity Detector\backend\ai\embedding_model.py)
- [similarity_engine.py](C:\Programs\codex\AI Idea Similarity Detector\backend\ai\similarity_engine.py)

It:

- loads `all-MiniLM-L6-v2`
- generates normalized embeddings
- stores vectors in FAISS
- performs cosine-similarity retrieval
- returns top similar ideas

## Dataset

The main sample dataset is:

- [dataset/ideas.json](C:\Programs\codex\AI Idea Similarity Detector\dataset\ideas.json)

It contains 1000 ideas with:

- `id`
- `title`
- `description`
- `category`
- `source`

## Notes

- The transformer model downloads on first run.
- The frontend uses a shared demo session for local exploration, so the UI can exercise authenticated endpoints without a manual login step.
- For local development outside Docker, use `localhost` in the backend database URL.
- Docker Compose overrides the database host to `db`.
