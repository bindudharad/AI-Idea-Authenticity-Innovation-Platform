from __future__ import annotations

from dataclasses import dataclass

from services.innovation_service import InnovationService


@dataclass
class InnovationScoreV2Result:
    score: float
    breakdown: dict[str, float]
    category: str


class InnovationScoreEngineV2:
    """Weighted innovation scoring engine aligned with the frontend v2 calculation."""

    WEIGHTS = {
        "originality": 0.30,
        "technology": 0.20,
        "market": 0.15,
        "research": 0.10,
        "competition": 0.10,
        "impact": 0.15,
    }

    def compute(self, analysis) -> InnovationScoreV2Result:
        """Generate a weighted innovation score from an AnalysisResponse."""
        breakdown = {
            "originality": float(analysis.innovation_breakdown.get("originality", analysis.innovation_score)),
            "technology": float(analysis.innovation_breakdown.get("technology_novelty", 70)),
            "market": float(analysis.innovation_breakdown.get("market_uniqueness", 70)),
            "research": float(analysis.innovation_breakdown.get("research_alignment", 65)),
            "competition": max(0.0, 100.0 - float(analysis.similarity_score)),
            "impact": float(analysis.future_impact.get("social_impact", 70)),
        }

        score = sum(breakdown[key] * weight for key, weight in self.WEIGHTS.items())
        score = max(0.0, min(100.0, score))

        return InnovationScoreV2Result(
            score=round(score, 1),
            breakdown=breakdown,
            category=InnovationService().classify_innovation_score(score),
        )
