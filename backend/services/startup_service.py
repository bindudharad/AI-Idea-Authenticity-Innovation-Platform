class StartupService:
    """Rates commercial viability using lightweight business heuristics."""

    def analyze(self, idea_text: str, innovation_score: float) -> dict[str, float | str]:
        """Estimate startup strength across market demand, competition, and scalability."""
        normalized = idea_text.lower()
        market_demand = 78 if any(word in normalized for word in ["ai", "health", "finance", "education"]) else 68
        competition_level = 72 if innovation_score < 45 else 54
        scalability = 82 if any(word in normalized for word in ["platform", "saas", "marketplace", "api"]) else 70
        startup_potential_score = round((market_demand + (100 - competition_level) + scalability) / 3, 2)
        return {
            "market_demand": "High" if market_demand >= 75 else "Moderate",
            "competition_level": "High" if competition_level >= 70 else "Moderate",
            "scalability": "High" if scalability >= 78 else "Moderate",
            "startup_potential_score": startup_potential_score,
        }
