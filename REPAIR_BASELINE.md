# REPAIR BASELINE DOCUMENTATION

**Project:** AI Idea Authenticity & Innovation Platform  
**Location:** `C:\Programs\codex\AI-Idea-Authenticity-Innovation-Platform`  
**Baseline Date:** November 1, 2026  
**Baseline Git Commit:** `fa3fca743e65fabbd906b550f742b6e0600cfecf`  
**Safety Branch Created:** `backup/pre-repair-baseline`  

---

## 1. Initial State & Directory Structure

- **Backend:** Python FastAPI (`backend/`), SQLAlchemy ORM, Uvicorn, Passlib, ReportLab, Sentence Transformers, FAISS.
- **Frontend:** Next.js 16 (`frontend/`), React 18, Tailwind CSS, Lucide icons, Recharts, React Flow, Zustand, Prisma 7 client.
- **Database:** PostgreSQL configured via `docker-compose.yml` (`postgres:16-alpine`), but disconnected/conflicting between Prisma (`schema.prisma`) and SQLAlchemy (`models.py`).
- **AI/ML:** `sentence-transformers/all-MiniLM-L6-v2` with a SHA-256 fallback; FAISS IndexFlatIP recomputed on every request; heuristic scoring in `backend/services/`.
- **Datasets:**
  - `backend/dataset/ideas.json`: 1,000 records (only 40 unique descriptions, repeated 25 times).
  - `dataset/ideas.json`: Incompatible schema in root.
  - `innovation_dataset_10000.json`: 10,000-record synthetic dataset in root (unused).

---

## 2. Initial Test & Build Results

1. **Frontend Lint / Typecheck (`npm --prefix frontend run lint`):**
   - **Result:** FAILED (Exit Code 1)
   - **Root Cause:** `@prisma/client` missing exported types (`PrismaClient`, `User`, `Idea`, `Team`, `AnalysisResult`).
2. **AI Embedding Pipeline:**
   - **Result:** FAILED to load `SentenceTransformer` due to Keras 3 / Transformers runtime incompatibility.
   - **Consequence:** Active silent fallback to SHA-256 byte hashing, giving 81.2% similarity between drone medicine delivery and a chocolate chip cookie recipe.
3. **Automated Test Infrastructure:**
   - **Result:** 0 unit tests, 0 integration tests, 0 end-to-end tests across the entire repository.
4. **Git Security Audit:**
   - **Result:** Plaintext API keys for Groq, Hugging Face, and GitHub committed in commit `b7cd267` in `.env.example`.

---

## 3. Inventory of Known Defects (From `AUDIT_REPORT.md`)

| ID | Issue | Severity | Target Module |
|---|---|---|---|
| **ISS-01** | Historical API secrets in git history | CRITICAL (P0) | Git history / `.env.example` |
| **ISS-02** | IDOR on analysis results endpoints | CRITICAL (P0) | `backend/routes/idea_routes.py` |
| **ISS-03** | Dual database schema mismatch (SQLAlchemy vs Prisma) | CRITICAL (P0) | `backend/database/models.py` & `frontend/prisma` |
| **ISS-04** | Frontend auth route mismatch (`/api/auth/login` vs `/api/login`) | CRITICAL (P0) | `frontend/services/auth-service.ts` & `backend/routes/auth_routes.py` |
| **ISS-05** | Missing team collaboration endpoints in FastAPI | CRITICAL (P0) | `backend/routes/` & `frontend/services/idea-service.ts` |
| **ISS-06** | Silent SHA-256 hash fallback in embeddings | HIGH (P1) | `backend/ai/embedding_model.py` |
| **ISS-07** | Frontend type error / build failure on Prisma types | HIGH (P1) | `frontend/lib/db.ts` |
| **ISS-08** | Wildcard CORS origin with credentials enabled | HIGH (P1) | `backend/main.py` |
| **ISS-09** | Missing root `.gitignore` & committed `venv` | HIGH (P1) | Root `.gitignore` |
| **ISS-10** | Host `node_modules` overwrite in Dockerfile | HIGH (P1) | `docker/Dockerfile.frontend` |
| **ISS-11** | Real-time O(N) re-embedding per request (FAISS bypass) | HIGH (P1) | `backend/services/similarity_service.py` |
| **ISS-12** | 10 App Router pages redirecting to `/dashboard` | MEDIUM (P2) | `frontend/app/*/page.tsx` |
| **ISS-13** | Certificate filename collision / overwrite vulnerability | MEDIUM (P2) | `backend/services/certificate_service.py` |
| **ISS-14** | Active dataset has 96% duplicate descriptions | MEDIUM (P2) | `backend/dataset/ideas.json` |
| **ISS-15** | `NEXT_PUBLIC_API_URL` vs `NEXT_PUBLIC_API_BASE_URL` mismatch | MEDIUM (P2) | `frontend/services/api.ts` |
| **ISS-16** | Rogue `backend/server.js` colliding with port 3000 | LOW (P3) | `backend/server.js` |
| **ISS-17** | Unused 4.5MB root dataset | LOW (P3) | `innovation_dataset_10000.json` |
| **ISS-18** | README claims diverging from actual code | LOW (P3) | `README.md` |

---

## 4. Preservation Invariants

The following assets must remain completely intact and functional throughout the repair:
- All custom glassmorphic UI components, cards, tables, badges, buttons in `frontend/components/` and `frontend/ui/`.
- Voice assistant UI, particle visualizers, 3D tilt effects, sound effects (`SoundManager.ts`).
- Brand assets: Team Vortex logos, banners, icons in `frontend/public/` and `public/`.
- Working FastAPI validation logic and Pydantic schemas.
- Original `AUDIT_REPORT.md` (MUST NOT be overwritten or modified).
