# UPDATED ARCHITECTURE SPECIFICATION

**Project:** AI Idea Authenticity & Innovation Platform  
**Architecture Status:** Production-Ready & Verified  
**Date:** November 1, 2026  

---

## 1. High-Level Architectural Overview

The AI Idea Authenticity & Innovation Platform is structured as a decoupled, multi-tier full-stack system designed for low-latency AI inferencing, scalable relational persistence, and secure multi-tenant collaboration.

```mermaid
flowchart TD
    subgraph Client["Client Tier (Next.js 16 / React 18)"]
        UI["Glassmorphic UI / Tailwind CSS"]
        Pages["App Router (70 Pages & Dynamic Routes)"]
        State["Zustand Store & Client Session"]
    end

    subgraph Gateway["API Gateway Tier (FastAPI)"]
        CORS["CORS & Security Middleware"]
        AuthMid["JWT Auth Handler (PBKDF2 / Bcrypt)"]
        Router["FastAPI Route Handlers (/api/*)"]
    end

    subgraph Services["Core Business Logic & AI Engines"]
        IdeaService["Idea Orchestration Service"]
        SimService["Similarity & Retrieval Service"]
        InnovService["Multi-Factor Innovation Engine"]
        JudgeService["Explainable Hackathon Judge"]
        TeamService["Team Collaboration Engine"]
        CertService["Cryptographic Certificate Generator"]
    end

    subgraph AI["AI Vector Engine"]
        ST["SentenceTransformers (all-MiniLM-L6-v2)"]
        FAISS["Persistent FAISS IndexFlatIP (384-Dim)"]
    end

    subgraph Persistence["Storage & Database Tier"]
        PG[("PostgreSQL Relational DB (SQLAlchemy)")]
        DiskStorage["Local / Container Storage (Certificates, FAISS)"]
    end

    UI --> Router
    Router --> AuthMid
    Router --> IdeaService
    Router --> TeamService

    IdeaService --> SimService
    IdeaService --> InnovService
    IdeaService --> JudgeService
    IdeaService --> CertService
    IdeaService --> PG

    TeamService --> PG

    SimService --> ST
    SimService --> FAISS

    CertService --> DiskStorage
    FAISS --> DiskStorage
```

---

## 2. End-to-End Analysis Data Flow

When a user submits an idea for authenticity and innovation analysis, the platform processes the request through the following deterministic pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as Founder / Developer
    participant UI as Next.js Presentation Tier
    participant API as FastAPI Gateway
    participant IdeaSvc as Idea Service
    participant Model as Embedding Model (MiniLM-L6-v2)
    participant FAISS as Persistent FAISS Index
    participant Innov as Innovation Scoring Service
    participant Judge as Judging Service
    participant DB as PostgreSQL Database

    User->>UI: Submit Idea Name, Text, & Category
    UI->>API: POST /api/analyze-idea (Bearer Token)
    API->>API: Validate Token (sub/userId) & Request Schema
    API->>IdeaSvc: analyze_idea(payload, current_user)
    
    IdeaSvc->>Model: encode(idea_text)
    Model-->>IdeaSvc: 384-dimensional normalized vector

    IdeaSvc->>FAISS: search_with_filter(query_vector, top_k=5, mode)
    FAISS-->>IdeaSvc: Top 5 semantically closest reference projects + cosine scores

    IdeaSvc->>Innov: calculate_innovation_score(similarity, profile, startup)
    Note over Innov: Weighted: 40% Novelty + 25% Tech Depth + 20% Market + 15% Feasibility
    Innov-->>IdeaSvc: Calibrated innovation_score (0-100)

    IdeaSvc->>Judge: score(idea_text, innovation_score, profile, startup)
    Note over Judge: Multi-criterion rubric + actionable explainability feedback
    Judge-->>IdeaSvc: Judging metrics & qualitative notes

    IdeaSvc->>DB: Persist analysis snapshot & update idea history
    IdeaSvc-->>API: Full AnalysisResponse JSON
    API-->>UI: Complete Evaluation Payload
    UI-->>User: Render Interactive Visualizations (Graph, Radar, Scenarios)
```

---

## 3. Database Architecture (SQLAlchemy Authority)

The database schema is managed authoritatively by SQLAlchemy in `backend/database/models.py`.

```mermaid
erDiagram
    User ||--o{ Idea : "owns"
    User ||--o{ TeamMember : "participates"
    User ||--o{ Notification : "receives"
    User ||--o{ ActivityLog : "triggers"
    Team ||--o{ TeamMember : "contains"
    Team ||--o{ TeamMessage : "hosts"
    Team ||--o{ TeamNote : "contains"
    Team ||--o{ Idea : "shares"
    Idea ||--o{ IdeaVersion : "tracks"
    Idea ||--o{ AnalysisResult : "evaluates"
    Idea ||--o{ Certificate : "generates"

    User {
        int id PK
        string full_name
        string email UK
        string hashed_password
        datetime created_at
    }

    Idea {
        int id PK
        int owner_id FK
        int team_id FK
        string title
        text description
        string mode
        bool is_public
        float innovation_score
        float latest_similarity_score
        json result
        datetime created_at
        datetime updated_at
    }

    Team {
        int id PK
        string name
        string code UK
        int leader_id FK
        datetime created_at
    }

    TeamMember {
        int id PK
        int team_id FK
        int user_id FK
        string role
        datetime joined_at
    }

    TeamMessage {
        int id PK
        int team_id FK
        int sender_id FK
        text content
        datetime created_at
    }

    AnalysisResult {
        int id PK
        int idea_id FK
        float innovation_score
        float similarity_score
        float technology_readiness
        float market_potential
        text ai_summary
        json innovation_highlights
        datetime created_at
    }

    Certificate {
        int id PK
        int idea_id FK
        int user_id FK
        string certificate_number UK
        string file_path
        datetime issued_at
    }

    ReferenceIdea {
        int id PK
        string title
        text description
        string mode
        string source
        json tags
    }
```

---

## 4. AI & Vector Engine Architecture

### Model Specifications
- **Model:** `sentence-transformers/all-MiniLM-L6-v2`
- **Inference Runtime:** PyTorch (`USE_TF=0`, `USE_TORCH=1`)
- **Embedding Dimension:** 384 dimensions
- **Normalization:** L2 Euclidean normalization ($\|\vec{v}\|_2 = 1.0$), ensuring inner product equals cosine similarity.

### FAISS Vector Database
- **Index Type:** `faiss.IndexFlatIP` (Exact Inner Product Cosine Search)
- **Index Persistence File:** `backend/storage/faiss/idea_index.faiss` (384 KB)
- **Metadata Persistence File:** `backend/storage/faiss/idea_index_meta.json` (149 KB)
- **Dataset Size:** 260 distinct high-fidelity benchmark ideas spanning 8 core industry verticals.
- **Query Performance:** Pre-loaded in RAM on startup; search latency is sub-15ms.

---

## 5. Security & Authorization Architecture

1. **Object-Level Authorization (IDOR Defense):**
   - Every state-altering or private data retrieval operation resolves via `_owned_idea(idea_id, user_id)` or `_accessible_idea(idea_id, user_id)`.
   - Private ideas are strictly unreachable by non-owners (yielding 404/403).
   - Team-shared ideas require verified membership in `TeamMember`.

2. **Unified JWT Contract:**
   - Dual claims: `sub` (standard) and `userId` (Next.js client compatibility) are embedded in every token.
   - Dual-scheme password hashing: Passlib supports both `pbkdf2_sha256` and `bcrypt` with automatic legacy migration.
   - Production validation: Startup is halted if the default JWT secret is detected when `APP_ENV=production`.

3. **Certificate Security:**
   - Filenames incorporate SHA-256 entropy based on `idea_id`, `owner_id`, and exact registration timestamp, preventing overwrites.
   - Strict canonical path traversal checks prevent directory climbing (`..`, `%2e%2e`).

4. **CORS Hardening:**
   - CORS origin configuration parses explicit allowed domains from environment configurations. Wildcard origins combined with credentials are strictly prohibited.
