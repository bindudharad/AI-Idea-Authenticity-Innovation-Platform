from sqlalchemy.orm import Session

from database import models
from database.schemas import TeamNoteCreate, TeamWorkspaceResponse


class TeamService:
    """Owns collaboration entities such as notes, comments, and team members."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def ensure_team(self, idea: models.Idea) -> models.Team:
        """Every idea gets a team shell so collaboration can be attached consistently."""
        if idea.team:
            return idea.team
        team = models.Team(name=f"{idea.title} Team", idea=idea)
        self.db.add(team)
        self.db.flush()
        return team

    def add_note(self, idea: models.Idea, payload: TeamNoteCreate, author_id: int) -> TeamWorkspaceResponse:
        """Persist a new note and return the refreshed workspace view."""
        team = self.ensure_team(idea)
        note = models.TeamNote(team_id=team.id, author_id=author_id, content=payload.content)
        self.db.add(note)
        self.db.commit()
        self.db.refresh(team)
        return self.workspace_response(idea)

    def workspace_response(self, idea: models.Idea) -> TeamWorkspaceResponse:
        """Shape ORM data into a response model tailored for the frontend workspace."""
        team = self.ensure_team(idea)
        self.db.flush()
        members = [
            {"id": member.user.id, "full_name": member.user.full_name, "email": member.user.email, "role": member.role}
            for member in team.members
            if member.user
        ]
        notes = [
            {
                "id": note.id,
                "content": note.content,
                "author_id": note.author_id,
                "created_at": note.created_at,
            }
            for note in team.notes
        ]
        return TeamWorkspaceResponse(team_name=team.name, members=members, notes=notes)
