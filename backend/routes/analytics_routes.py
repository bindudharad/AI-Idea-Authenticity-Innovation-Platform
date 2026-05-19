from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from database.schemas import AnalyticsResponse
from services.idea_service import IdeaService
from utils.security import get_current_user


router = APIRouter(tags=["Analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db), current_user=Depends(get_current_user)) -> AnalyticsResponse:
    """Return dashboard analytics for the signed-in user."""
    return IdeaService(db).get_analytics(current_user)
