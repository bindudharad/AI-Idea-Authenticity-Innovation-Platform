from __future__ import annotations


class OpportunityFinder:
    """Simple opportunity scoring utility for backend parity."""

    def compute(self, market_demand: float, research_growth: float, competition_level: float, technology_growth: float) -> dict:
        score = (
            technology_growth * 0.35
            + market_demand * 0.30
            + research_growth * 0.20
            - competition_level * 0.15
        )
        score = max(0.0, min(100.0, score))
        level = "High" if score >= 80 else "Moderate" if score >= 60 else "Emerging"
        return {
            "score": round(score, 1),
            "level": level,
        }
