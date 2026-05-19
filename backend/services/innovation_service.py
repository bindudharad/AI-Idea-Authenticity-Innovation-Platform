class InnovationService:
    """Encapsulates scoring logic so analytics stay consistent across endpoints."""

    @staticmethod
    def calculate_innovation_score(top_similarity: float) -> float:
        """Innovation is inversely proportional to the closest semantic match."""
        return round(max(0.0, 100.0 - top_similarity), 2)

    @staticmethod
    def originality_breakdown(innovation_score: float) -> dict[str, float]:
        """Create chart-friendly radar metrics for the frontend analytics dashboard."""
        originality = innovation_score
        feasibility = min(96.0, 55.0 + innovation_score * 0.35)
        complexity = min(92.0, 48.0 + innovation_score * 0.28)
        market_potential = min(94.0, 50.0 + innovation_score * 0.32)
        return {
            "originality": round(originality, 2),
            "feasibility": round(feasibility, 2),
            "complexity": round(complexity, 2),
            "market_potential": round(market_potential, 2),
        }

    @staticmethod
    def score_breakdown(similarity_score: float, idea_profile: dict, startup_analysis: dict) -> dict[str, float]:
        """Explain the innovation score using novelty, similarity, and market context."""
        technology_novelty = 78.0 if len(idea_profile.get("technology_stack", [])) >= 2 else 69.0
        market_uniqueness = 76.0 if startup_analysis.get("competition_level") == "Moderate" else 62.0
        return {
            "similarity_score": round(similarity_score, 2),
            "technology_novelty": round(max(0.0, technology_novelty - similarity_score * 0.15), 2),
            "market_uniqueness": round(market_uniqueness, 2),
            "innovation_score": round(max(0.0, 100.0 - similarity_score), 2),
        }
