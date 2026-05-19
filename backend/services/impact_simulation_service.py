class ImpactSimulationService:
    """Recalculate likely outcomes under different launch conditions."""

    def simulate(self, innovation_score: float, market_insights: dict) -> list[dict[str, object]]:
        """Provide scenario cards the frontend can render without additional API round-trips."""
        baseline_market = float(market_insights.get("market_size_billion_usd", 1.0))
        return [
            {
                "name": "India launch / efficient build / strong public support",
                "launch_country": "India",
                "technology_cost": "Low",
                "government_support": "High",
                "adoption_probability": round(min(95.0, 52 + innovation_score * 0.45), 2),
                "market_readiness": round(baseline_market * 1.12, 2),
            },
            {
                "name": "US launch / premium stack / moderate support",
                "launch_country": "United States",
                "technology_cost": "Medium",
                "government_support": "Moderate",
                "adoption_probability": round(min(95.0, 48 + innovation_score * 0.42), 2),
                "market_readiness": round(baseline_market * 1.18, 2),
            },
            {
                "name": "EU launch / compliance-heavy stack / grants available",
                "launch_country": "Germany",
                "technology_cost": "High",
                "government_support": "High",
                "adoption_probability": round(min(95.0, 44 + innovation_score * 0.39), 2),
                "market_readiness": round(baseline_market * 1.09, 2),
            },
        ]
