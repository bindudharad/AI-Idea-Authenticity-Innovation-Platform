from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.db import get_db
from database.schemas import (
    ActivityLogResponse,
    IdeaResponse,
    NotificationResponse,
    NotificationUpdate,
    TeamActionResponse,
    TeamCreate,
    TeamJoin,
    TeamMessageCreate,
    TeamMessageResponse,
    TeamShareIdea,
    TeamSummaryResponse,
)
from services.team_service import TeamCollaborationService
from utils.security import get_current_user

router = APIRouter(tags=["Team Collaboration"])


@router.post("/team/create", response_model=TeamActionResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> TeamActionResponse:
    """Create a new collaboration team with an invite code."""
    team = TeamCollaborationService(db).create_team(payload.name, current_user)
    return TeamActionResponse(success=True, team=team)


@router.post("/team/join", response_model=TeamActionResponse)
def join_team(
    payload: TeamJoin,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> TeamActionResponse:
    """Join an existing collaboration team using an invite code."""
    team = TeamCollaborationService(db).join_team(payload.code, current_user)
    return TeamActionResponse(success=True, team=team)


@router.get("/team/me", response_model=list[TeamSummaryResponse])
def get_my_teams(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[TeamSummaryResponse]:
    """Retrieve all teams the current authenticated user belongs to."""
    return TeamCollaborationService(db).get_my_teams(current_user)


@router.get("/team/{team_id}/ideas", response_model=list[IdeaResponse])
def get_team_ideas(
    team_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[IdeaResponse]:
    """Retrieve all ideas shared with a team."""
    return TeamCollaborationService(db).get_team_ideas(team_id, current_user)


@router.post("/team/{team_id}/ideas", response_model=IdeaResponse)
def share_idea_with_team(
    team_id: int,
    payload: TeamShareIdea,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> IdeaResponse:
    """Share an owned idea with a team workspace."""
    parsed_idea_id = int(payload.ideaId)
    return TeamCollaborationService(db).share_idea_with_team(team_id, parsed_idea_id, current_user)


@router.delete("/team/{team_id}/members/{member_id}")
def remove_team_member(
    team_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> dict[str, bool]:
    """Remove a member from the team (team leader only)."""
    success = TeamCollaborationService(db).remove_member(team_id, member_id, current_user)
    return {"success": success}


@router.get("/team/{team_id}/messages", response_model=list[TeamMessageResponse])
def get_team_messages(
    team_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[TeamMessageResponse]:
    """Retrieve recent chat messages for a team."""
    return TeamCollaborationService(db).get_messages(team_id, current_user)


@router.post("/team/{team_id}/messages", response_model=TeamMessageResponse, status_code=status.HTTP_201_CREATED)
def send_team_message(
    team_id: int,
    payload: TeamMessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> TeamMessageResponse:
    """Send a chat message to a team workspace."""
    return TeamCollaborationService(db).send_message(team_id, payload.content, current_user)


@router.get("/team/{team_id}/activity", response_model=list[ActivityLogResponse])
def get_team_activity(
    team_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[ActivityLogResponse]:
    """Retrieve recent collaboration activity logs for a team."""
    return TeamCollaborationService(db).get_activity(team_id, current_user)


@router.get("/notifications", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[NotificationResponse]:
    """Retrieve in-app notifications for the current authenticated user."""
    return TeamCollaborationService(db).get_notifications(current_user)


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    _payload: NotificationUpdate | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> NotificationResponse:
    """Mark an in-app notification as read."""
    return TeamCollaborationService(db).mark_notification_read(notification_id, current_user)
