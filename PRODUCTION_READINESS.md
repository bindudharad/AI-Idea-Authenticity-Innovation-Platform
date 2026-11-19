# PRODUCTION READINESS & DEPLOYMENT RUNBOOK

**Project:** AI Idea Authenticity & Innovation Platform  
**Target Environments:** Staging / Production Kubernetes / Docker Compose  
**Date:** November 1, 2026  

---

## 1. Environment Configuration

All production secrets must be set via secure environment variables or vault secret managers. Never commit production credentials into version control.

### Required Production Environment Variables

| Variable | Description | Production Example / Guideline |
|---|---|---|
| `APP_ENV` | Application environment mode | `production` (enforces strict security validation) |
| `DEBUG` | FastAPI debug mode | `false` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:strongpass@pgbouncer.prod:5432/idea_platform` |
| `JWT_SECRET_KEY` | High-entropy signing secret (min 32 chars) | `generate with: openssl rand -hex 32` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session validity duration | `1440` (24 hours) |
| `FRONTEND_URL` | Canonical frontend domain | `https://ideas.yourdomain.com` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://ideas.yourdomain.com,https://api.yourdomain.com` |
| `EMBEDDING_MODEL_NAME` | HuggingFace embedding model | `sentence-transformers/all-MiniLM-L6-v2` |
| `USE_TF` | Disable TensorFlow clash | `0` |
| `USE_TORCH` | Enforce PyTorch backend | `1` |
| `FAISS_INDEX_PATH` | Path to persistent vector index | `/app/backend/storage/faiss/idea_index.faiss` |
| `FAISS_METADATA_PATH` | Path to vector metadata | `/app/backend/storage/faiss/idea_index_meta.json` |
| `CERTIFICATE_OUTPUT_DIR` | Path to generated certificate PDFs | `/app/backend/storage/certificates` |
| `DATASET_PATH` | Reference ideas dataset path | `/app/backend/dataset/ideas.json` |

---

## 2. Containerized Deployment via Docker Compose

### Step 1: Clone and Configure Secrets
```bash
git clone https://github.com/your-org/AI-Idea-Authenticity-Innovation-Platform.git
cd AI-Idea-Authenticity-Innovation-Platform

# Generate secure secrets
export JWT_SECRET=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -hex 24)

# Create production .env file
cat <<EOF > .env
APP_ENV=production
DEBUG=false
POSTGRES_DB=idea_platform
POSTGRES_USER=idea_admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DATABASE_URL=postgresql://idea_admin:$POSTGRES_PASSWORD@db:5432/idea_platform
JWT_SECRET_KEY=$JWT_SECRET
FRONTEND_URL=https://ideas.yourdomain.com
CORS_ORIGINS=https://ideas.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EOF
```

### Step 2: Build and Launch Services
```bash
docker compose up -d --build
```

### Step 3: Verify Container Health
```bash
docker compose ps
```
Both `idea-platform-db` and `idea-platform-backend` will report healthy states via their automated healthchecks.

---

## 3. High Availability & Scaling Recommendations

1. **FastAPI Process Concurrency:**
   - In production containers, run Uvicorn with Gunicorn process management:
     ```bash
     gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
     ```
   - Worker count guideline: $2 \times \text{vCPU} + 1$.

2. **Database Connection Pooling:**
   - Place **PgBouncer** in front of PostgreSQL to handle high-concurrency client connection spikes without exhausting database thread limits.
   - Configure SQLAlchemy pool settings:
     ```python
     create_engine(..., pool_size=20, max_overflow=10, pool_pre_ping=True)
     ```

3. **FAISS Vector Index Scaling:**
   - For datasets up to 1,000,000 vectors, in-memory `IndexFlatIP` or `IndexIVFFlat` easily handles thousands of queries per second on a single 4-core instance.
   - For multi-instance horizontal scaling, replicate the persistent index files across instances via shared read-only volumes (EFS / Cloud Storage) or deploy a dedicated Qdrant / Milvus vector cluster.

4. **Next.js Frontend Caching:**
   - Deploy behind a CDN (Cloudflare or CloudFront) to cache static assets (`/_next/static/*`), icons, and fonts at edge locations.

---

## 4. Operational Runbook & Maintenance

### Database Migrations
```bash
# Run migrations using the authoritative backend CLI
docker compose exec backend alembic upgrade head
```

### Re-indexing Reference Ideas & FAISS
```bash
docker compose exec backend python scripts/seed_dataset.py
```

### Log Inspection
```bash
# Backend logs
docker compose logs -f backend

# Database logs
docker compose logs -f db

# Frontend logs
docker compose logs -f frontend
```

### Backup & Disaster Recovery
```bash
# Backup PostgreSQL database
docker compose exec -T db pg_dump -U idea_admin -d idea_platform | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup Certificates and FAISS Vector Stores
tar -czf storage_backup_$(date +%Y%m%d).tar.gz backend/storage/
```
