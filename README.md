# AI Idea Authenticity & Innovation Platform

> Validate, score, and benchmark startup or hackathon ideas using semantic embeddings, FAISS vector search, and a chain of specialised analysis services — all in one API call.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

Submit any startup or hackathon idea as plain text and receive a comprehensive report covering originality scoring, semantic similarity detection, market forecasting, competitor intelligence, pitch generation, and a downloadable PDF ownership certificate. The platform is built for **startup founders**, **hackathon teams**, and **innovation managers** who need structured, reproducible idea evaluation without manual research.

---

## Table of Contents

- [Project Overview](#project-overview)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Product Showcase](#product-showcase)
- [Directory Structure](#directory-structure)
- [Features](#features)
- [AI / ML Pipeline](#ai--ml-pipeline)
- [AI Architecture: What Is ML, What Is Heuristic, What Is LLM](#ai-architecture-what-is-ml-what-is-heuristic-what-is-llm)
- [Quick Start](#quick-start)
- [Installation (Manual)](#installation-manual)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Dataset](#dataset)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Limitations](#limitations)
- [Project Status](#project-status)
- [Future Improvements](#future-improvements)

---

## Project Overview

The **AI Idea Authenticity & Innovation Platform** is designed for:

- **Startup founders** who want to validate whether their idea is sufficiently differentiated before investing resources.
- **Hackathon teams** who need rapid feedback on novelty, market fit, and technical approach.
- **Innovation managers and accelerators** who evaluate many ideas and need structured, reproducible scoring.

When a user submits an idea, the backend encodes the text into a 384-dimensional vector using `sentence-transformers/all-MiniLM-L6-v2`, compares it against a dataset of reference ideas via FAISS cosine similarity, and drives a chain of downstream analysis services to produce similarity scores, innovation scores, market forecasts, impact timelines, evolution roadmaps, pitch narratives, judging rubrics, and recommendation stacks — all returned in a single API response that the frontend renders across ~30 dedicated pages.

---

## How It Works

```mermaid
flowchart TD
    A["User submits idea text\n+ name + mode startup/business"] --> B

    B["IdeaAnalysisEngine\nKeyword-based NLP profiler\nExtracts: industry, tech stack,\ntarget audience, risks"] --> C["Structured Idea Profile"]

    A --> D["EmbeddingModel\nsentence-transformers/all-MiniLM-L6-v2\nProduces 384-dim vector"]

    D --> E["SimilarityEngine\nFAISS IndexFlatIP\nCosine similarity search"]

    F["Reference Dataset\nreference_ideas table\nPostgreSQL — filtered by mode"] --> E

    E --> G["Top 5 Similar Projects\nwith cosine similarity scores"]

    G --> H["InnovationService\nscore = 100 minus top_similarity\nInversely proportional to best match"]

    H --> I["Innovation Score"]

    C --> J
    I --> J
    G --> J

    J["Specialised Analysis Services\nAll deterministic or heuristic unless noted"] --> K1["StartupService\nMarket demand, competition,\nscalability heuristics"]
    J --> K2["MarketPredictionService\nEstimated market size, CAGR,\nbest launch countries"]
    J --> K3["FutureImpactService\nAdoption curve, social impact,\nrisk level — formula-based"]
    J --> K4["CompetitorService\nIntelligence derived from\nsimilarity matches"]
    J --> K5["EvolutionService\nThree-phase product roadmap\nV1 / V2 / V3"]
    J --> K6["PitchService\nStructured pitch narrative\nproblem, solution, market, tech"]
    J --> K7["JudgingService\nHackathon rubric scoring"]
    J --> K8["SuggestionService\nImprovement suggestions"]
    J --> K9["CertificateService\nReportLab PDF generation"]

    K1 & K2 & K3 & K4 & K5 & K6 & K7 & K8 --> L["AnalysisResponse\nSingle JSON object"]

    L --> M["Next.js Frontend\n~30 dedicated module pages"]

    K9 --> N["PDF Certificate\nDownloadable ownership record"]
```

**Step-by-step request flow:**

1. The user authenticates and submits idea text via `POST /api/analyze-idea`.
2. `IdeaAnalysisEngine` profiles the idea text with keyword matching — extracting industry, technology stack, target audience, risk factors, and innovation category.
3. `EmbeddingModel` encodes the idea text into a 384-dimensional float32 vector using `sentence-transformers/all-MiniLM-L6-v2`.
4. `SimilarityEngine` runs an exact inner-product (cosine) search against the FAISS index built from reference and community ideas, filtered by mode.
5. `InnovationService` calculates `innovation_score = 100 – top_cosine_similarity`. Higher originality → lower similarity → higher innovation score.
6. Fifteen specialised services run downstream using the idea profile, innovation score, and matched records as inputs. Most of these are deterministic formula-based or rule-based services (see [AI Architecture](#ai-architecture-what-is-ml-what-is-heuristic-what-is-llm)).
7. A single `AnalysisResponse` is returned and distributed across the frontend's module pages (market, competitors, pitch, graph, evolution, etc.).
8. If the idea is registered (`POST /api/register-idea`), a PDF ownership certificate is generated and stored.

---

## Architecture

```mermaid
flowchart TD
    U["User / Browser"] -->|HTTPS| FE["Next.js 16 Frontend\n:3000"]
    FE -->|REST + JWT| API["FastAPI Backend\n:8000"]
    API --> DB[("PostgreSQL\n:5432")]
    API --> EMB["Sentence Transformer\nall-MiniLM-L6-v2"]
    EMB --> FAISS["FAISS Vector Index\nCosine Similarity"]
    FAISS --> DS["Reference Dataset\nideas.json"]
    API --> SRVC["Analysis Services\n15+ specialised services"]
    SRVC --> CERT["ReportLab PDF\nCertificate Generator"]
    API -->|Optional| LLM["OpenAI GPT-4o-mini\nHelp Chat only"]
    FE --> PG[("Prisma / PostgreSQL\nFrontend DB layer")]
    FE -->|Socket.IO| WS["Real-time\nTeam Chat"]
```

**Request flow:**

1. The Next.js frontend sends a JWT-authenticated `POST /api/analyze-idea` with the idea text.
2. FastAPI encodes the text with the shared `EmbeddingModel` singleton.
3. The `SimilarityService` queries `SimilarityEngine` (FAISS) against all reference + community records.
4. The top cosine-similarity score drives the `InnovationService` formula (`innovation_score = 100 – top_similarity`).
5. Fifteen specialised services run downstream (startup analysis, market prediction, competitor intelligence, future impact, evolution roadmap, pitch deck, judging, etc.).
6. A single `AnalysisResponse` is returned and distributed across the frontend module pages.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 18, TypeScript 5, Tailwind CSS 3 |
| **Frontend State** | Zustand, React Context |
| **Frontend Charts** | Recharts, ReactFlow, react-force-graph-2d, react-simple-maps, react-gauge-chart |
| **Frontend Real-time** | Socket.IO Client |
| **Frontend ORM** | Prisma 7 (PostgreSQL adapter) |
| **Export** | jsPDF, html2pdf.js, docx, pptxgenjs, QRCode |
| **Frontend Animations** | Framer Motion, react-tsparticles, react-type-animation |
| **Backend** | FastAPI 0.115, Python 3.11, Uvicorn |
| **Backend ORM** | SQLAlchemy 2.0 |
| **Database** | PostgreSQL 16 |
| **Semantic Embeddings** | Sentence Transformers — `all-MiniLM-L6-v2` (384-dim) |
| **Vector Search** | FAISS (IndexFlatIP cosine similarity) with NumPy fallback |
| **Authentication** | JWT (python-jose, HS256, 24-hour expiry), PBKDF2-SHA256 password hashing |
| **PDF Generation** | ReportLab 4 |
| **LLM (optional)** | OpenAI `gpt-4o-mini` (help chat only) |
| **Package Manager** | npm (frontend), pip (backend) |
| **Containerisation** | Docker, Docker Compose 3.9 |
| **Frontend Deployment** | Netlify (netlify.toml present) |

---

## Product Showcase

> No live application UI screenshots have been captured yet. The sections below show the platform's promo and team assets that exist in the repository.

### Platform Feature Overview

![Advanced Features](frontend/public/team/advanced_features.png)

*Platform features: AI Decision Engine, Market Analysis, Risk Prediction, Investor Intelligence, Strategy Builder, and Location Profit Heatmap.*

### Innovation Lab

![Innovation Lab — Team Vortex](frontend/public/team/innovation_lab.png)

*Team Vortex — collaborative innovation workspace concept.*

---

> **Note for contributors:** To add real application screenshots, capture the following pages from the running application and place them in `docs/screenshots/`:
>
> | Page | Suggested filename |
> |---|---|
> | `/analyze` — idea submission form | `docs/screenshots/analyze.png` |
> | `/dashboard` — user analytics | `docs/screenshots/dashboard.png` |
> | `/results` — full analysis output | `docs/screenshots/results.png` |
> | `/idea-graph` — force-directed graph | `docs/screenshots/idea_graph.png` |
> | `/market-insights` — market forecast | `docs/screenshots/market_insights.png` |
> | `/pitch-generator` — pitch deck | `docs/screenshots/pitch_generator.png` |
> | `/certificate` — PDF certificate | `docs/screenshots/certificate.png` |
> | `/team-workspace` — collaboration | `docs/screenshots/team_workspace.png` |

---

## Directory Structure

```
AI Idea Authenticity & Innovation Platform/
│
├── backend/                        # FastAPI Python application
│   ├── ai/
│   │   ├── embedding_model.py      # Sentence Transformer loader + hash fallback
│   │   └── similarity_engine.py   # FAISS index management and cosine search
│   ├── database/
│   │   ├── db.py                   # SQLAlchemy engine + session factory
│   │   ├── models.py               # ORM models (User, Idea, Team, Certificate, …)
│   │   └── schemas.py              # Pydantic request/response models
│   ├── routes/
│   │   ├── auth_routes.py          # /register, /login, /user/me
│   │   ├── idea_routes.py          # All idea analysis and management endpoints
│   │   ├── analytics_routes.py     # Dashboard analytics endpoint
│   │   └── help_routes.py          # In-app smart help chat endpoint
│   ├── services/                   # 15+ analysis services
│   │   ├── idea_service.py         # Central orchestrator for all analysis flows
│   │   ├── idea_analysis_engine.py # Idea profiling (industry, stack, audience)
│   │   ├── similarity_service.py   # Embedding + FAISS search coordination
│   │   ├── innovation_service.py   # Innovation score calculation and radar metrics
│   │   ├── innovation_score_engine_v2.py  # Weighted multi-factor scoring
│   │   ├── startup_service.py      # Startup viability heuristics
│   │   ├── market_prediction_service.py   # Market size and launch geography
│   │   ├── future_impact_service.py       # Adoption and impact timeline
│   │   ├── evolution_service.py    # Three-phase product roadmap
│   │   ├── competitor_service.py   # Competitor intelligence from matched records
│   │   ├── pitch_service.py        # Structured pitch deck narrative
│   │   ├── certificate_service.py  # ReportLab PDF certificate generator
│   │   ├── judging_service.py      # Hackathon judging rubric scoring
│   │   ├── suggestion_service.py   # Improvement suggestions
│   │   ├── trend_service.py        # Architecture graph + trend data
│   │   ├── resource_scanner_service.py    # Matched resource scan
│   │   ├── idea_graph_service.py   # Node-edge relationship graph
│   │   ├── impact_simulation_service.py   # Scenario impact simulation
│   │   ├── team_service.py         # Team workspace management
│   │   ├── ownership_service.py    # Idea version history
│   │   └── help_chat_service.py    # In-app support (OpenAI + fallback)
│   ├── storage/
│   │   ├── faiss/                  # Persisted FAISS index + metadata JSON
│   │   └── certificates/           # Generated PDF certificates
│   ├── utils/
│   │   ├── security.py             # JWT creation + password hashing
│   │   ├── helpers.py              # Dataset utilities
│   │   └── logger.py               # Structured logging configuration
│   ├── scripts/
│   │   └── seed_dataset.py         # Generate 1,000-record dev dataset
│   ├── dataset/
│   │   └── ideas.json              # Runtime reference dataset (auto-generated)
│   ├── config.py                   # Pydantic settings (env-loaded)
│   ├── main.py                     # FastAPI app factory + CORS + lifespan
│   └── requirements.txt
│
├── frontend/                       # Next.js 16 TypeScript application
│   ├── app/                        # Next.js App Router pages (~30 routes)
│   │   ├── analyze/                # Main idea submission and analysis page
│   │   ├── dashboard/              # User analytics dashboard
│   │   ├── results/                # Full analysis results viewer
│   │   ├── idea-graph/             # Interactive force-directed relationship graph
│   │   ├── idea-novelty/           # Novelty and originality breakdown
│   │   ├── idea-evolution/         # Product evolution roadmap
│   │   ├── market-insights/        # Market size and forecast charts
│   │   ├── market/                 # Market analysis page
│   │   ├── impact-simulation/      # Scenario impact simulation
│   │   ├── competitors/            # Competitor intelligence view
│   │   ├── investor-insights/      # Investor and funding analysis
│   │   ├── investor/               # Investor decision engine
│   │   ├── pitch-generator/        # Auto-generated pitch deck narrative
│   │   ├── blueprint/              # Startup build plan and tech stack
│   │   ├── digital-twin/           # Digital twin simulation environment
│   │   ├── innovation-lab/         # Innovation experimentation page
│   │   ├── innovation-leaderboard/ # Community rankings
│   │   ├── innovation-universe/    # Visual innovation landscape
│   │   ├── global-analysis/        # Global market analysis
│   │   ├── global-innovation-map/  # Geographic innovation map
│   │   ├── mentor/                 # AI mentor coaching page
│   │   ├── simulator/              # Scenario simulator
│   │   ├── team/                   # Team management
│   │   ├── team-workspace/         # Collaborative workspace with notes
│   │   ├── community/              # Public idea explorer
│   │   ├── similar/                # Similar ideas browser
│   │   ├── saved-ideas/            # User's saved idea library
│   │   ├── certificate/            # PDF certificate download
│   │   ├── profile/                # User profile
│   │   ├── login/ & register/      # Authentication
│   │   ├── location/               # Location intelligence
│   │   └── api/                    # Next.js API routes (proxy + Prisma)
│   ├── services/                   # Frontend API client services
│   ├── components/                 # Shared UI components
│   ├── store/                      # Zustand global state
│   ├── types/                      # TypeScript type definitions
│   ├── utils/                      # Export helpers (PDF, DOCX, PPTX)
│   ├── prisma/
│   │   └── schema.prisma           # Frontend Prisma schema (User, Idea, Team, …)
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── dataset/                        # (Legacy / alternate location for dataset files)
├── docker/
│   ├── Dockerfile.backend          # Python 3.11-slim image
│   └── Dockerfile.frontend         # Node 20-alpine image
├── public/                         # Static team assets (logos, banners)
├── generate_dataset.py             # Standalone 10,000-record dataset generator
├── innovation_dataset_10000.json   # Pre-generated 10,000-record reference file
├── docker-compose.yml              # Full-stack orchestration (db + backend + frontend)
├── .env.example                    # Root-level env variable template
└── README.md
```

---

## Features

### Core Features
- **Idea Submission** — Submit any startup or hackathon idea as free text with a name and mode (startup/business).
- **Semantic Similarity Detection** — Encodes idea text with `all-MiniLM-L6-v2` and compares against reference + community ideas via FAISS cosine similarity. Returns top 5 matching projects with scores.
- **Innovation Score** — Calculated as `100 – top_similarity_score`. Includes a multi-axis radar breakdown (originality, feasibility, complexity, market potential).
- **Idea Registration & Versioning** — Persist ideas to PostgreSQL with ownership tracking and full version history.
- **Community Explorer** — Browse and sort public ideas by innovation score, recency, or popularity.
- **PDF Ownership Certificate** — Generate a downloadable ReportLab PDF recording idea name, owner, date, innovation score, and similarity score.

### AI / ML Features
- **Sentence Transformer Embeddings** — `sentence-transformers/all-MiniLM-L6-v2` with a deterministic hash-based fallback when the model is unavailable.
- **FAISS Vector Index** — Persistent `IndexFlatIP` (inner-product / cosine) index over reference dataset embeddings. Falls back to NumPy matrix multiply when FAISS is unavailable.
- **Idea Analysis Engine** — Keyword-based NLP profiler that extracts industry vertical, technology stack, target audience, problem statement, risk factors, and innovation category from idea text.
- **Weighted Innovation Score V2** — Multi-factor scorer with configurable weights across originality (30%), technology (20%), impact (15%), market (15%), research (10%), and competition (10%).
- **Market Prediction** — Estimates market size (in \$B USD), CAGR growth forecast, best launch countries, and yearly projection index from industry and innovation score.
- **Future Impact Modelling** — Projects adoption probability, social impact score, risk level, and a 20-year timeline (2026–2045).
- **Idea Evolution Roadmap** — Three-phase product roadmap (V1 / V2 / V3) derived from the idea profile.
- **Startup Viability Heuristics** — Rates market demand, competition level, and scalability.
- **Business Analysis Engine** — For business-mode ideas: estimates demand, competition, profit potential, location suitability, initial investment, expected revenue, break-even time, and risk level.
- **AI Help Chat** — Platform-scoped support assistant. Uses OpenAI `gpt-4o-mini` when `OPENAI_API_KEY` is set, falls back to deterministic keyword matching.

### User Features
- **Authentication** — Email/password registration and login with JWT bearer tokens (24-hour expiry).
- **Personal Idea Library** — Save, update, and manage a personal portfolio of ideas.
- **Team Workspace** — Collaborative workspace with members, notes, and team messaging (Socket.IO).
- **Idea Graph** — Force-directed graph visualising how an idea connects to technologies, research areas, and competitors.
- **Pitch Generator** — Structured startup pitch with problem, solution, market, technology, business model, and future vision sections.
- **Report Export** — Export analysis reports as PDF or DOCX; pitch decks as PPTX.
- **QR Code** — Generated for certificate verification.
- **Analytics Dashboard** — Personal metrics: total ideas, average innovation score, trend analysis, radar chart, engine status.

### Backend Features
- **Auto-bootstrapping** — On startup, the backend creates database tables and seeds the reference dataset from `backend/dataset/ideas.json` automatically.
- **Multiple Route Aliases** — Endpoints have camelCase and kebab-case aliases for compatibility with both the Python-first backend and the Next.js API proxy routes.
- **Modular Services** — Each analysis concern is a self-contained service class.
- **Structured Logging** — Configurable logging via `utils/logger.py`.

### Dataset Features
- **Runtime Dataset** — `backend/dataset/ideas.json` (auto-generated on first run via `helpers.generate_sample_ideas`).
- **Development Seed** — `backend/scripts/seed_dataset.py` generates a 1,000-record dev dataset.
- **Large Reference Dataset** — `generate_dataset.py` generates a 10,000-record dataset (`innovation_dataset_10000.json`) across 10 categories (AI, Healthcare, Energy, Transportation, Robotics, Agriculture, Space, Education, Environment, Cybersecurity).

### Security Features
- JWT HS256 authentication on all protected endpoints.
- PBKDF2-SHA256 password hashing (passlib).
- JWT secret and database credentials configured via environment variables.
- CORS middleware (configured for development; restrict in production).

### Developer Features
- Interactive Swagger UI at `http://localhost:8000/docs`.
- Docker Compose full-stack launch in one command.
- Netlify deployment configuration for the frontend.
- Prisma schema for the frontend's own PostgreSQL layer (users, teams, messages, notifications, activity logs).

---

## AI / ML Pipeline

```mermaid
flowchart TD
    A["Idea Text Input"] --> B["IdeaAnalysisEngine\nKeyword NLP Profiler"]
    B --> C["industry / stack / audience\nrisks / problem statement"]
    A --> D["EmbeddingModel\nall-MiniLM-L6-v2\n384-dim vector"]
    D --> E["SimilarityEngine\nFAISS IndexFlatIP\nCosine Search"]
    E --> F["Reference + Community Records\nPostgreSQL filtered by mode"]
    F --> E
    E --> G["Top 5 Similar Projects\nwith Cosine Scores"]
    G --> H["InnovationService\nscore = 100 minus top_similarity"]
    H --> I["innovation_score"]
    I --> J["InnovationScoreEngineV2\nWeighted: originality 30%\ntechnology 20%, impact 15%\nmarket 15%, research 10%\ncompetition 10%"]
    J --> K["Weighted Innovation Score"]
    C --> L["Downstream Services\nStartup / Market / Impact\nCompetitors / Evolution\nPitch / Judging / Blueprint"]
    I --> L
    G --> L
    L --> M["AnalysisResponse\nReturned to Frontend"]
```

**Key details:**

| Component | Description |
|---|---|
| **Model** | `sentence-transformers/all-MiniLM-L6-v2` — 384-dimensional sentence embeddings |
| **Fallback** | SHA-256 hash-based deterministic embedding when the model is unavailable |
| **Index type** | `faiss.IndexFlatIP` — exact inner-product search on L2-normalised vectors (equivalent to cosine) |
| **Persistence** | Index saved to `backend/storage/faiss/idea_index.faiss`; metadata to `idea_index_meta.json` |
| **Similarity score** | Cosine similarity × 100, rounded to 2 decimal places |
| **Innovation score** | `max(0, 100 − top_similarity_score)` |
| **Mode filtering** | Records are pre-filtered by `mode` (`hackathon` for startup, `business` for business) before search |

---

## AI Architecture: What Is ML, What Is Heuristic, What Is LLM

This section clearly separates what the platform genuinely does with machine learning from what is deterministic or rule-based. Accurate understanding of these boundaries is important for both developers and evaluators.

### Genuinely Machine-Learning Powered

| Component | What it does |
|---|---|
| **`EmbeddingModel` (`all-MiniLM-L6-v2`)** | Encodes idea text into a 384-dimensional semantic vector using a pre-trained Sentence Transformer model. This is the only component that uses a trained neural network at inference time. |
| **`SimilarityEngine` (FAISS `IndexFlatIP`)** | Performs exact cosine similarity search over the stored embedding vectors. The similarity scores are produced by the neural embeddings, not by keyword matching. |
| **`SimilarityService`** | Coordinates text embedding and FAISS retrieval. The quality of matches directly depends on the quality of the `all-MiniLM-L6-v2` model. |

### Heuristic / Rule-Based (Deterministic)

The following services use keyword matching, predefined formulas, and fixed rules. They do **not** use machine learning models:

| Service | Method |
|---|---|
| **`IdeaAnalysisEngine`** | Keyword frequency matching against predefined lists to classify industry, technology stack, audience, and risks. |
| **`InnovationService`** | Single formula: `innovation_score = 100 − top_similarity`. Radar metrics derived by linear interpolation from innovation score. |
| **`InnovationScoreEngineV2`** | Weighted sum of heuristic sub-scores with fixed weights (originality 30%, technology 20%, etc.). |
| **`StartupService`** | Keyword presence checks (`"ai"`, `"health"`, `"platform"`, etc.) mapped to fixed demand/competition/scalability numbers. |
| **`MarketPredictionService`** | Fixed country presets per industry category; market size and CAGR derived from linear formula on innovation score. |
| **`FutureImpactService`** | Adoption probability and social impact calculated via linear formulas from innovation score; 20-year timeline uses fixed slope values. |
| **`BusinessAnalysisService`** | Keyword-based local/premium intent detection; all financial metrics (investment, revenue, break-even) are deterministic formula outputs. |
| **`EvolutionService`** | Fixed three-phase roadmap template populated with idea profile strings. |
| **`CompetitorService`** | Competitor intelligence derived from the top similarity matches already found by FAISS, not from live external data. |
| **`PitchService`** | Template-based narrative populated with idea profile and market fields. |
| **`JudgingService`** | Rule-based rubric scoring. |
| **`SuggestionService`** | Rule-based improvement suggestions. |
| **`ResourceScannerService`** | Keyword-matching against similarity results; does **not** call external APIs (USPTO, GitHub, arXiv, Wikipedia) at runtime. |

> **Important:** Market size estimates, financial projections, adoption curves, and risk ratings produced by the platform are **heuristic estimates based on the innovation score and keyword detection** — they are not sourced from live market databases or validated economic models.

### LLM-Powered (Optional, Help Chat Only)

| Component | Model | Behaviour |
|---|---|---|
| **`HelpChatService`** | OpenAI `gpt-4o-mini` | Used **only** for the in-app help chat assistant (`POST /api/help-chat`). Activated when `OPENAI_API_KEY` is set. |
| **Fallback** | None (deterministic) | When `OPENAI_API_KEY` is absent or the API call fails, the help chat responds with deterministic keyword-based answers. No LLM is used for idea analysis, scoring, or any other feature. |

> The `GROQ_API_KEY` and `NVIDIA_API_KEY` settings exist in the configuration but are **not used by any service** in the current codebase.

### What Depends on the Reference Dataset

The quality of similarity detection depends entirely on the content and coverage of `backend/dataset/ideas.json`. The default dataset is synthetically generated. Ideas submitted against a sparse or narrow dataset will receive less meaningful similarity scores. See [Limitations](#limitations) for details.

---

## Quick Start

> **Prerequisites:** Python 3.11+, Node.js 20+, PostgreSQL 16 (or Docker)

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd "AI Idea Authenticity & Innovation Platform"

# 2. ── BACKEND ─────────────────────────────────────────────
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt

# Copy and edit the environment file
copy .env.example .env
# Open .env and set DATABASE_URL, JWT_SECRET_KEY, and optional API keys

# Start the backend (tables and dataset are created automatically on first run)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 3. ── FRONTEND (separate terminal) ──────────────────────
cd ../frontend
npm install

# Copy and edit the environment file
copy .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

**Backend:** `http://localhost:8000`  
**Backend docs:** `http://localhost:8000/docs`  
**Frontend:** `http://localhost:3000`

---

## Installation (Manual)

### Prerequisites

- Python 3.11 or later
- Node.js 20 or later
- npm 10 or later
- PostgreSQL 16 (local install or Docker)

### Step 1 — Clone

```bash
git clone <your-repository-url>
cd "AI Idea Authenticity & Innovation Platform"
```

### Step 2 — Set up PostgreSQL

```bash
# With Docker (recommended for local dev):
docker run -d \
  --name idea-platform-db \
  -e POSTGRES_DB=idea_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

Or install PostgreSQL locally and create the `idea_platform` database manually.

### Step 3 — Configure the backend

```bash
cd backend
copy .env.example .env     # Windows
# cp .env.example .env     # macOS / Linux
```

Edit `backend/.env` with your actual values (see [Environment Variables](#environment-variables)).

### Step 4 — Install Python dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

### Step 5 — (Optional) Pre-seed the dataset

The backend auto-generates a minimal `backend/dataset/ideas.json` on first run. To use the large 10,000-record dataset instead:

```bash
# From the project root:
python generate_dataset.py
# Then copy innovation_dataset_10000.json → backend/dataset/ideas.json
```

Or generate the 1,000-record dev dataset:

```bash
cd backend
python scripts/seed_dataset.py
```

### Step 6 — Start the backend

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

On first start, the backend:
1. Creates all PostgreSQL tables via SQLAlchemy.
2. Seeds `reference_ideas` from `backend/dataset/ideas.json` (once).

### Step 7 — Configure and start the frontend

```bash
cd frontend
copy .env.example .env.local     # Windows
# cp .env.example .env.local     # macOS / Linux
```

Set at minimum:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/idea_platform"
JWT_SECRET="a-strong-random-secret"
```

```bash
npm install
npm run dev
```

Frontend runs on **port 3000** by default.

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `AI Idea Authenticity & Innovation Platform API` | Application display name |
| `APP_ENV` | `development` | Environment name |
| `DEBUG` | `true` | Enable FastAPI debug mode |
| `API_PREFIX` | `/api` | URL prefix for all API routes |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin (for CORS reference) |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/idea_platform` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | *(must change)* | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT validity (24 hours) |
| `EMBEDDING_MODEL_NAME` | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace model identifier |
| `OPENAI_API_KEY` | *(optional)* | Enables GPT-4o-mini for the help chat |
| `GROQ_API_KEY` | *(optional, unused)* | Reserved for future Groq LLM integration |
| `NVIDIA_API_KEY` | *(optional, unused)* | Reserved for future NVIDIA integration |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model name (reserved, not yet used) |
| `FAISS_INDEX_PATH` | `backend/storage/faiss/idea_index.faiss` | FAISS index file path |
| `FAISS_METADATA_PATH` | `backend/storage/faiss/idea_index_meta.json` | FAISS metadata file path |
| `CERTIFICATE_OUTPUT_DIR` | `backend/storage/certificates` | PDF certificate output directory |
| `DATASET_PATH` | `backend/dataset/ideas.json` | Reference dataset file path |

### Frontend — `frontend/.env.local`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for the Prisma frontend layer |
| `JWT_SECRET` | Secret for signing frontend-managed JWTs |
| `NEXT_PUBLIC_API_URL` | Backend API root URL (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL including prefix (e.g. `http://localhost:8000/api`) |

> **Never commit `.env` or `.env.local` files to version control.** These are already listed in `.gitignore`.

---

## API Reference

All routes are prefixed with `/api`. Protected routes require a `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | Public | Create a new user account |
| `POST` | `/api/login` | Public | Authenticate and receive a JWT token |
| `GET` | `/api/user/me` | Required | Return the current user's profile |

### Idea Analysis

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analyze-idea` | Required | Full idea analysis pipeline |
| `POST` | `/api/analyze-full` | Required | Extended business ecosystem analysis |
| `POST` | `/api/similarityCheck` | Required | Similarity score and top matching ideas |
| `POST` | `/api/innovationScore` | Required | Innovation score slice only |
| `POST` | `/api/resourceScanner` | Required | Idea profile + resource scan |
| `POST` | `/api/marketPrediction` | Required | Market opportunity and competitor data |
| `POST` | `/api/impactPrediction` | Required | Future impact, simulations, and evolution |
| `POST` | `/api/ideaGraph` | Required | Node-edge graph for visualisation |
| `POST` | `/api/generate-suggestions` | Required | Improvement suggestions |

### Idea Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register-idea` | Required | Save an idea with ownership metadata |
| `PUT` | `/api/ideas/{idea_id}` | Required | Update an owned idea |
| `GET` | `/api/ideas` | Required | List the user's saved ideas |
| `GET` | `/api/ideas/{idea_id}` | Required | Retrieve a single saved idea |
| `GET` | `/api/ideas/{idea_id}/full-analysis` | Required | Re-run analysis on a saved idea |
| `GET` | `/api/ideas/{idea_id}/certificate` | Required | Download ownership certificate as PDF |
| `GET` | `/api/ideas/{idea_id}/latest-analysis` | Required | Most recent stored analysis result |
| `GET` | `/api/similar-ideas?query=...&mode=...` | Required | Semantic similarity search |
| `GET` | `/api/community?sort_by=...` | Required | Browse public community ideas |

### Analysis Results

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analysis-results` | Required | Store an analysis result record |
| `GET` | `/api/analysis-results/{idea_id}` | Required | Retrieve all results for an idea |

### Team Workspace

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/ideas/{idea_id}/workspace` | Required | Get team workspace details |
| `POST` | `/api/ideas/{idea_id}/notes` | Required | Add a note to a workspace |

### Analytics & Help

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics` | Required | Dashboard analytics for the signed-in user |
| `POST` | `/api/help-chat` | Public | In-app smart help assistant |

**Example — Analyze an idea:**

```bash
curl -X POST http://localhost:8000/api/analyze-idea \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "idea_name": "EduBot AI",
    "idea_text": "An AI tutoring platform that adapts to individual student learning styles using NLP and predictive analytics.",
    "idea_type": "startup"
  }'
```

**Interactive documentation:** `http://localhost:8000/docs`

---

## Dataset

### Runtime Reference Dataset (`backend/dataset/ideas.json`)

This dataset seeds the `reference_ideas` database table on the first backend startup. It contains structured idea records:

```json
{
  "title": "...",
  "description": "...",
  "mode": "hackathon",
  "source": "...",
  "tags": ["...", "..."]
}
```

The backend auto-generates this file on first run using `utils.helpers.generate_sample_ideas`. The seeding runs once — if the `reference_ideas` table already has records, no duplicate data is inserted.

### Large Reference Dataset (`innovation_dataset_10000.json`)

Generated by `generate_dataset.py` at the project root. Contains 10,000 innovation records across 10 categories:

| Category | Fields |
|---|---|
| AI, Healthcare, Energy, Transportation, Robotics, Agriculture, Space, Education, Environment, Cybersecurity | `id`, `idea_name`, `description`, `category`, `innovation_year`, `impact_score`, `keywords` |

**To regenerate:**

```bash
# From the project root
python generate_dataset.py
```

This produces `innovation_dataset_10000.json` (~4–5 MB). To use it as the backend reference dataset, copy it to `backend/dataset/ideas.json` (after adapting the schema fields — this file uses a different schema from the runtime dataset).

### Development Seed (1,000 records)

```bash
cd backend
# Ensure venv is active
python scripts/seed_dataset.py
```

Writes 1,000 sample records to `backend/dataset/ideas.json`.

---

## Docker Deployment

Docker Compose launches the complete stack: PostgreSQL, FastAPI backend, and Next.js frontend.

```bash
# From the project root:
docker compose build
docker compose up
```

| Service | Container | Port |
|---|---|---|
| PostgreSQL 16 | `idea-platform-db` | 5432 |
| FastAPI Backend | `idea-platform-backend` | 8000 |
| Next.js Frontend | `idea-platform-frontend` | 3000 |

> **Note:** The Docker Compose file includes a hardcoded `JWT_SECRET_KEY` placeholder (`change-this-secret-in-production`). Override this with a proper secret before any production deployment.

**Persistent volumes:**

| Volume | Contents |
|---|---|
| `postgres_data` | Database files |
| `backend_certificates` | Generated PDF certificates |
| `backend_faiss` | FAISS index and metadata |

To stop and remove containers:

```bash
docker compose down
```

To remove volumes as well:

```bash
docker compose down -v
```

---

## Testing

Automated tests are not currently included in the repository.

The backend has dependency injection patterns and self-contained service classes that are well-suited for unit testing with `pytest` and `httpx.AsyncClient`. The FastAPI lifespan pattern and SQLAlchemy sessions support test database isolation.

---

## Troubleshooting

### Port already in use

```bash
# Backend default port
netstat -ano | findstr :8000    # Windows
# Kill the process using the PID shown, then restart uvicorn

# Frontend default port
netstat -ano | findstr :3000
```

### Database connection failed

- Ensure PostgreSQL is running on port 5432.
- Verify `DATABASE_URL` in `backend/.env` matches your PostgreSQL credentials.
- The backend logs a warning and continues without persistence if the DB is unreachable.

### `sentence-transformers` model not downloading

- The model is downloaded from HuggingFace on the first backend startup. Ensure outbound HTTPS is available.
- If the model fails to load, the backend uses a SHA-256 hash fallback and continues operating.

### FAISS not available

- If `faiss-cpu` fails to install (e.g. unsupported platform), the backend falls back to NumPy matrix multiply for cosine search. Functionality is preserved but performance degrades at scale.

### Missing `backend/dataset/ideas.json`

- The file is created automatically on first backend startup.
- Alternatively, run `python backend/scripts/seed_dataset.py` manually.

### Frontend cannot reach backend

- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local` points to `http://localhost:8000`.
- Check CORS: the backend allows all origins in development (`allow_origins=["*"]`).

### Docker build fails

- Ensure Docker Desktop is running.
- Run `docker compose down -v` to clean state, then `docker compose build --no-cache`.

### Certificate generation fails

- Ensure `backend/storage/certificates/` exists and is writable.
- The directory is created automatically if missing.

### OpenAI help chat not responding

- `OPENAI_API_KEY` is optional. When absent, the help chat falls back to deterministic keyword-based responses.

---

## Security

| Area | Current State | Production Recommendation |
|---|---|---|
| JWT secret | Configurable via `JWT_SECRET_KEY` | Use a cryptographically random 256-bit secret |
| Password hashing | PBKDF2-SHA256 via passlib | Already secure; bcrypt is an alternative |
| Database credentials | Loaded from `.env` | Use a secrets manager in production |
| CORS | `allow_origins=["*"]` (development) | Restrict to the frontend origin in production |
| API keys | Stored in `.env`, never logged | Rotate any keys accidentally committed to git |
| `.gitignore` | `.env` and `.env.local` are excluded | Verify before every commit |

**If any secret value has been committed to the repository history, rotate it immediately** — changing the file is not sufficient as the value remains in git history.

---

## Limitations

The following limitations are based on direct inspection of the codebase and are documented here to set accurate expectations.

### Similarity and Dataset Quality

- Similarity detection quality depends entirely on the coverage and diversity of the reference dataset (`backend/dataset/ideas.json`). The default dataset is **synthetically generated** using templates and keyword combinations — it is not sourced from real-world startup databases, patent filings, or research repositories.
- Ideas in domains not well-represented in the reference dataset may receive low or misleading similarity scores.
- The 10,000-record `innovation_dataset_10000.json` uses a **different schema** (`idea_name`, `category`, `innovation_year`, `impact_score`, `keywords`) from the backend's runtime dataset (`title`, `description`, `mode`, `source`, `tags`). It cannot be used directly as the backend reference dataset without schema adaptation.

### Market and Financial Predictions Are Heuristic Estimates

- All market size figures, CAGR projections, break-even timelines, competition levels, profit potentials, initial investment estimates, and adoption curves are produced by **deterministic formula-based services** using the innovation score and keyword detection as inputs. They are **not** sourced from live market databases, validated economic models, or external APIs.
- These outputs should be treated as directional orientation points, not as financial forecasts.

### External Data Scanning Is Not Live

- Frontend routes such as `searchPatents`, `searchGithub`, `searchWikipedia`, and `searchArxiv` exist in the `frontend/app/api/` directory. However, the backend's `ResourceScannerService` does **not** call USPTO, GitHub, arXiv, Wikipedia, or any other external data source at runtime. Resource scan results are derived from the FAISS similarity matches already found, not from live external searches.

### No Automated Tests

- The repository contains no unit tests, integration tests, or end-to-end tests. All functionality has been implemented without a test suite.

### Production Security Gaps

- CORS is configured with `allow_origins=["*"]` — this must be restricted before any internet-facing deployment.
- Rate limiting and API throttling are not implemented. The API endpoints have no request-rate controls.
- The Docker Compose file includes a plaintext `JWT_SECRET_KEY` placeholder that must be replaced before deployment.

### LLM and External AI Integration Is Minimal

- OpenAI GPT-4o-mini is used **only** for the help chat assistant. It plays no role in idea analysis, scoring, market prediction, or any other core analytical function.
- `GROQ_API_KEY` and `NVIDIA_API_KEY` are present in the configuration but are not used by any service in the current codebase.

### Ownership Certificate — Important Notice

The PDF certificate generated by this platform (`/api/ideas/{idea_id}/certificate`) is a **platform-generated record** that documents the idea name, owner, submission date, innovation score, and similarity score as recorded by this system. It is **not a legal document** and does **not establish, confer, or constitute intellectual property rights** of any kind. If intellectual property protection is required, consult a qualified IP attorney and pursue appropriate filings (patents, trademarks, copyright registration, etc.).

### Partially Implemented Features

- The frontend Prisma layer (team messaging, notifications, activity logs) is defined in `schema.prisma` but the frontend relies primarily on the FastAPI backend for data operations; full Prisma integration is incomplete.
- Socket.IO real-time team chat is wired on the client side, but server-side handling depends on the Next.js custom server (`server.js`) and is not fully integrated with the backend.

---

## Project Status

### Implemented

- Full JWT authentication (register, login, protected routes)
- Semantic similarity detection via FAISS + Sentence Transformers
- Innovation scoring (basic and weighted V2)
- Idea profiling engine (industry, stack, audience, risks)
- Startup, market, future impact, evolution, competitor, pitch, judging, and suggestion services
- Idea registration with versioning and ownership
- Team workspace with notes
- PDF ownership certificate generation (ReportLab)
- Community idea explorer with sorting
- Analytics dashboard
- In-app help chat (OpenAI + keyword fallback)
- Node-edge idea graph
- ~30 frontend pages covering all major modules
- Full Docker Compose stack
- Netlify deployment configuration
- Report export (PDF, DOCX, PPTX)

### In Progress / Partially Implemented

- Frontend Prisma layer — schema is complete but the frontend currently relies primarily on the FastAPI backend for data operations; the Prisma/Node layer adds team messaging, notifications, and activity logs.
- Groq and NVIDIA API integrations — configuration keys are present in `config.py` and `.env.example` but no service uses them yet.
- Socket.IO real-time team chat — client is wired up but server-side handling lives in the Next.js custom server (`server.js`).

### Planned / Not Yet Implemented

- Automated test suite (unit + integration)
- Rate limiting and API throttling
- Real external data sources (patent databases, GitHub, arXiv, Wikipedia) — placeholder routes exist in the frontend API but the backend does not call these APIs
- Production CORS hardening
- OAuth / social login

---

## Future Improvements

- **Real patent and research scanning** — Integrate USPTO, arXiv, and Semantic Scholar APIs to replace heuristic resource scanning with live data.
- **LLM-powered analysis** — Use Groq (Llama 3.3 70B) or OpenAI GPT-4o for richer idea profiling and suggestion generation, replacing keyword heuristics.
- **Automated testing** — Add `pytest` + `httpx` for backend unit and integration tests; Playwright or Vitest for frontend.
- **Production CORS and security hardening** — Restrict allowed origins, add rate limiting with `slowapi`, and enforce HTTPS.
- **Improved dataset quality** — Replace the synthetically generated reference dataset with curated records from real startup databases (e.g. Crunchbase, Product Hunt, AngelList).
- **Vector index scaling** — Migrate from `IndexFlatIP` to `IndexIVFFlat` for million-scale datasets.
- **Monitoring and observability** — Add Prometheus metrics and structured log shipping for production deployments.
- **Real-time collaboration** — Expand Socket.IO usage to support simultaneous multi-user editing of ideas and live analysis updates.
- **Scalability** — Add a Redis cache layer for repeated analysis results; consider Celery for async background processing of heavy analysis requests.

---

*Built by Team Vortex.*
