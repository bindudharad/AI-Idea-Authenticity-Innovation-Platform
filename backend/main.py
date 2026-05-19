from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import models  # noqa: F401 - ensures ORM models are registered before create_all
from database.db import Base, engine
from routes.analytics_routes import router as analytics_router
from routes.auth_routes import router as auth_router
from routes.help_routes import router as help_router
from routes.idea_routes import router as idea_router
from services.idea_service import IdeaService
from utils.logger import configure_logging, get_logger


configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Prepare infrastructure and bootstrap the idea index before the API starts serving traffic."""
    logger.info("Starting API bootstrap")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        logger.warning("Continuing without database persistence - data will not be saved")
    
    try:
        IdeaService().bootstrap_dataset()
        logger.info("Dataset bootstrapped successfully")
    except Exception as e:
        logger.error(f"Dataset bootstrap failed: {e}")
    
    logger.info("Bootstrap complete")
    yield
    logger.info("API shutdown complete")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(idea_router, prefix=settings.api_prefix)
app.include_router(analytics_router, prefix=settings.api_prefix)
app.include_router(help_router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict:
    """Simple health-style route for container liveness checks."""
    return {
        "message": settings.app_name,
        "environment": settings.app_env,
        "docs": "/docs",
    }
