from sqlalchemy.orm import Session

from database import models


class OwnershipService:
    """Handles idea ownership records and version history."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_version(self, idea: models.Idea, description: str, innovation_score: float) -> models.IdeaVersion:
        """Store a historical snapshot each time an idea is updated."""
        version_number = len(idea.versions) + 1
        version = models.IdeaVersion(
            idea_id=idea.id,
            version_number=version_number,
            description=description,
            innovation_score=innovation_score,
        )
        self.db.add(version)
        self.db.flush()
        return version
