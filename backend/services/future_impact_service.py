class FutureImpactService:
    """Project likely impact using lightweight heuristics from innovation and market signals."""

    def predict(self, idea_profile: dict, innovation_score: float, startup_analysis: dict) -> dict[str, object]:
        """Generate impact summary plus a long-range timeline."""
        market_demand = str(startup_analysis.get("market_demand", "Moderate"))
        adoption_probability = min(94.0, round(45 + innovation_score * 0.42, 2))
        social_impact = min(92.0, round(40 + innovation_score * 0.38, 2))
        risk_level = "Moderate" if innovation_score >= 45 else "Elevated"
        market_potential = "Strong" if market_demand == "High" else "Emerging"

        base = innovation_score / 10
        timeline = [
            {"year": 2026, "adoption": round(18 + base, 2), "impact": round(22 + base, 2)},
            {"year": 2030, "adoption": round(34 + base * 1.4, 2), "impact": round(38 + base * 1.45, 2)},
            {"year": 2035, "adoption": round(49 + base * 1.7, 2), "impact": round(56 + base * 1.8, 2)},
            {"year": 2045, "adoption": round(61 + base * 2.0, 2), "impact": round(70 + base * 2.1, 2)},
        ]

        return {
            "market_potential": market_potential,
            "adoption_probability": adoption_probability,
            "social_impact": social_impact,
            "risk_level": risk_level,
            "timeline": timeline,
            "outlook": (
                f"{idea_profile.get('innovation_category', 'Platform concept')} has the strongest upside when paired "
                "with a sharp niche and measurable proof of value in the first 12 months."
            ),
        }
