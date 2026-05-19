class JudgingService:
    """Simulates hackathon judging using transparent heuristics."""

    def score(self, idea_text: str, innovation_score: float) -> dict[str, float]:
        """Return 1-10 style judging scores derived from text richness and novelty."""
        word_count = max(1, len(idea_text.split()))
        innovation = min(10.0, max(1.0, innovation_score / 10))
        technical_complexity = min(10.0, 3.5 + word_count / 10)
        real_world_impact = min(10.0, 4.0 + innovation_score / 18)
        overall = round((innovation + technical_complexity + real_world_impact) / 3, 2)
        return {
            "innovation": round(innovation, 2),
            "technical_complexity": round(technical_complexity, 2),
            "real_world_impact": round(real_world_impact, 2),
            "overall": overall,
        }
