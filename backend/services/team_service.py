from __future__ import annotations

import secrets
from datetime import datetime
from typing import TYPE_CHECKING

from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from database import models
from database.schemas import (
    ActivityLogResponse,
    IdeaResponse,
    NotificationResponse,
    TeamMemberResponse,
    TeamMessageResponse,
    TeamSummaryResponse,
)

if TYPE_CHECKING:
    from database.models import User


def generate_team_code(length: int = 6) -> str:
    """Generate a clean, readable alphanumeric team invite code."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))


class TeamCollaborationService:
    """Provides full team collaboration, activity logging, messaging, and notification services."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def _get_membership(self, team_id: int, user_id: int) -> models.TeamMember | None:
        return (
            self.db.query(models.TeamMember)
            .filter(models.TeamMember.team_id == team_id, models.TeamMember.user_id == user_id)
            .first()
        )

    def _require_member(self, team_id: int, user_id: int) -> models.Team:
        team = self.db.query(models.Team).filter(models.Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found.")
        membership = self._get_membership(team_id, user_id)
        if not membership and team.leader_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Not a team member.")
        return team

    def _require_leader(self, team_id: int, user_id: int) -> models.Team:
        team = self._require_member(team_id, user_id)
        if team.leader_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the team leader can perform this operation.",
            )
        return team

    def _serialize_team(self, team: models.Team, current_user_id: int) -> TeamSummaryResponse:
        members_query = (
            self.db.query(models.TeamMember, models.User)
            .join(models.User, models.TeamMember.user_id == models.User.id)
            .filter(models.TeamMember.team_id == team.id)
            .order_by(models.TeamMember.created_at.asc())
            .all()
        )
        member_responses: list[TeamMemberResponse] = []
        user_role = "member"
        if team.leader_id == current_user_id:
            user_role = "leader"

        for member, user in members_query:
            if user.id == current_user_id and member.role:
                user_role = member.role
            member_responses.append(
                TeamMemberResponse(
                    id=str(member.id),
                    user_id=str(user.id),
                    full_name=user.full_name,
                    email=user.email,
                    role=member.role,
                    created_at=member.created_at.isoformat(),
                )
            )

        ideas_query = (
            self.db.query(models.Idea)
            .filter(models.Idea.team_id == team.id)
            .order_by(desc(models.Idea.created_at))
            .all()
        )
        idea_responses = [IdeaResponse.model_validate(item) for item in ideas_query]

        return TeamSummaryResponse(
            id=str(team.id),
            name=team.name,
            code=team.code,
            leader_id=str(team.leader_id),
            role=user_role,
            created_at=team.created_at.isoformat(),
            member_count=len(member_responses),
            members=member_responses,
            ideas=idea_responses,
        )

    def log_activity(
        self,
        user_id: int,
        action: str,
        detail: str,
        team_id: int | None = None,
        idea_id: int | None = None,
    ) -> models.ActivityLog:
        log = models.ActivityLog(
            user_id=user_id,
            team_id=team_id,
            idea_id=idea_id,
            action=action,
            detail=detail,
            created_at=datetime.utcnow(),
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def send_notification(
        self,
        user_id: int,
        text: str,
        type_: str = "info",
        team_id: int | None = None,
        idea_id: int | None = None,
    ) -> models.Notification:
        notification = models.Notification(
            user_id=user_id,
            text=text,
            type=type_,
            team_id=team_id,
            idea_id=idea_id,
            created_at=datetime.utcnow(),
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def create_team(self, name: str, user: User) -> TeamSummaryResponse:
        trimmed = name.strip()
        if len(trimmed) < 2:
            raise HTTPException(status_code=400, detail="Team name must be at least 2 characters.")

        # Ensure unique code
        code = ""
        for _ in range(5):
            candidate = generate_team_code()
            if not self.db.query(models.Team).filter(models.Team.code == candidate).first():
                code = candidate
                break
        if not code:
            raise HTTPException(status_code=500, detail="Failed to generate unique team code.")

        team = models.Team(
            name=trimmed,
            code=code,
            leader_id=user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(team)
        self.db.commit()
        self.db.refresh(team)

        # Leader is first member
        membership = models.TeamMember(
            team_id=team.id,
            user_id=user.id,
            role="leader",
            created_at=datetime.utcnow(),
        )
        self.db.add(membership)
        self.db.commit()

        self.log_activity(user.id, "team_created", f"Created team {team.name}.", team_id=team.id)
        return self._serialize_team(team, user.id)

    def join_team(self, code: str, user: User) -> TeamSummaryResponse:
        clean_code = code.strip().upper()
        team = self.db.query(models.Team).filter(models.Team.code == clean_code).first()
        if not team:
            raise HTTPException(status_code=404, detail="Invalid team code. Team not found.")

        existing = self._get_membership(team.id, user.id)
        if existing:
            return self._serialize_team(team, user.id)

        membership = models.TeamMember(
            team_id=team.id,
            user_id=user.id,
            role="member",
            created_at=datetime.utcnow(),
        )
        self.db.add(membership)
        self.db.commit()

        self.log_activity(user.id, "team_joined", f"{user.full_name} joined {team.name}.", team_id=team.id)
        self.send_notification(
            team.leader_id,
            f"{user.full_name} joined your team {team.name}.",
            type_="team",
            team_id=team.id,
        )
        return self._serialize_team(team, user.id)

    def get_my_teams(self, user: User) -> list[TeamSummaryResponse]:
        memberships = (
            self.db.query(models.TeamMember)
            .filter(models.TeamMember.user_id == user.id)
            .all()
        )
        team_ids = {m.team_id for m in memberships}
        teams = self.db.query(models.Team).filter(models.Team.id.in_(team_ids)).all() if team_ids else []
        return [self._serialize_team(t, user.id) for t in teams]

    def get_team_ideas(self, team_id: int, user: User) -> list[IdeaResponse]:
        self._require_member(team_id, user.id)
        ideas = (
            self.db.query(models.Idea)
            .filter(models.Idea.team_id == team_id)
            .order_by(desc(models.Idea.created_at))
            .all()
        )
        return [IdeaResponse.model_validate(item) for item in ideas]

    def share_idea_with_team(self, team_id: int, idea_id: int, user: User) -> IdeaResponse:
        team = self._require_member(team_id, user.id)
        idea = (
            self.db.query(models.Idea)
            .filter(models.Idea.id == idea_id, models.Idea.owner_id == user.id)
            .first()
        )
        if not idea:
            raise HTTPException(status_code=404, detail="Idea not found or not owned by user.")

        idea.team_id = team.id
        self.db.commit()
        self.db.refresh(idea)

        self.log_activity(
            user.id,
            "idea_shared",
            f"Shared idea '{idea.title}' with team {team.name}.",
            team_id=team.id,
            idea_id=idea.id,
        )
        return IdeaResponse.model_validate(idea)

    def remove_member(self, team_id: int, member_id: int, user: User) -> bool:
        team = self._require_leader(team_id, user.id)
        membership = (
            self.db.query(models.TeamMember)
            .filter(models.TeamMember.id == member_id, models.TeamMember.team_id == team.id)
            .first()
        )
        if not membership:
            raise HTTPException(status_code=404, detail="Team member not found.")

        if membership.user_id == team.leader_id:
            raise HTTPException(status_code=400, detail="Cannot remove the team leader.")

        self.db.delete(membership)
        self.db.commit()
        return True

    def send_message(self, team_id: int, content: str, user: User) -> TeamMessageResponse:
        team = self._require_member(team_id, user.id)
        trimmed = content.strip()
        if not trimmed:
            raise HTTPException(status_code=400, detail="Message content cannot be empty.")

        message = models.TeamMessage(
            team_id=team.id,
            user_id=user.id,
            content=trimmed,
            created_at=datetime.utcnow(),
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return TeamMessageResponse(
            id=str(message.id),
            content=message.content,
            user_id=str(user.id),
            full_name=user.full_name,
            created_at=message.created_at.isoformat(),
        )

    def get_messages(self, team_id: int, user: User, limit: int = 50) -> list[TeamMessageResponse]:
        self._require_member(team_id, user.id)
        messages = (
            self.db.query(models.TeamMessage, models.User)
            .join(models.User, models.TeamMessage.user_id == models.User.id)
            .filter(models.TeamMessage.team_id == team_id)
            .order_by(desc(models.TeamMessage.created_at))
            .limit(limit)
            .all()
        )
        results = [
            TeamMessageResponse(
                id=str(msg.id),
                content=msg.content,
                user_id=str(u.id),
                full_name=u.full_name,
                created_at=msg.created_at.isoformat(),
            )
            for msg, u in reversed(messages)
        ]
        return results

    def get_activity(self, team_id: int, user: User, limit: int = 40) -> list[ActivityLogResponse]:
        self._require_member(team_id, user.id)
        logs = (
            self.db.query(models.ActivityLog, models.User)
            .join(models.User, models.ActivityLog.user_id == models.User.id)
            .filter(models.ActivityLog.team_id == team_id)
            .order_by(desc(models.ActivityLog.created_at))
            .limit(limit)
            .all()
        )
        return [
            ActivityLogResponse(
                id=str(log.id),
                user_id=str(u.id),
                full_name=u.full_name,
                action=log.action,
                detail=log.detail,
                created_at=log.created_at.isoformat(),
                team_id=str(log.team_id) if log.team_id else None,
                idea_id=log.idea_id,
            )
            for log, u in logs
        ]

    def get_notifications(self, user: User, limit: int = 40) -> list[NotificationResponse]:
        notifications = (
            self.db.query(models.Notification)
            .filter(models.Notification.user_id == user.id)
            .order_by(desc(models.Notification.created_at))
            .limit(limit)
            .all()
        )
        return [
            NotificationResponse(
                id=str(n.id),
                text=n.text,
                type=n.type,
                read=n.read,
                team_id=str(n.team_id) if n.team_id else None,
                idea_id=n.idea_id,
                created_at=n.created_at.isoformat(),
            )
            for n in notifications
        ]

    def mark_notification_read(self, notification_id: int, user: User) -> NotificationResponse:
        n = (
            self.db.query(models.Notification)
            .filter(models.Notification.id == notification_id, models.Notification.user_id == user.id)
            .first()
        )
        if not n:
            raise HTTPException(status_code=404, detail="Notification not found.")
        n.read = True
        self.db.commit()
        self.db.refresh(n)
        return NotificationResponse(
            id=str(n.id),
            text=n.text,
            type=n.type,
            read=n.read,
            team_id=str(n.team_id) if n.team_id else None,
            idea_id=n.idea_id,
            created_at=n.created_at.isoformat(),
        )

    def ensure_team(self, idea: models.Idea) -> models.Team:
        """Every idea can attach to a team workspace."""
        if idea.team:
            return idea.team
        code = generate_team_code()
        team = models.Team(
            name=f"{idea.title} Team",
            code=code,
            leader_id=idea.owner_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(team)
        self.db.flush()
        idea.team_id = team.id
        return team

    def add_note(self, idea: models.Idea, payload: Any, author_id: int) -> dict[str, Any]:
        """Persist a workspace note."""
        team = self.ensure_team(idea)
        note = models.TeamNote(team_id=team.id, author_id=author_id, content=payload.content)
        self.db.add(note)
        self.db.commit()
        return {"id": note.id, "content": note.content}


TeamService = TeamCollaborationService
