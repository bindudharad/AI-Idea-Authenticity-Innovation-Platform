class MarketPredictionService:
    """Estimate market opportunity and launch geography from the idea profile."""

    COUNTRY_PRESETS = {
        "enterprise": ["United States", "United Kingdom", "Germany"],
        "edtech": ["India", "United States", "Singapore"],
        "healthcare": ["United States", "UAE", "Singapore"],
        "fintech": ["United States", "India", "Brazil"],
        "climate": ["Germany", "Netherlands", "United States"],
    }

    def predict(self, idea_profile: dict, innovation_score: float) -> dict[str, object]:
        """Return market size, growth, geography, and chart data."""
        industry = str(idea_profile.get("industry", "enterprise")).lower()
        market_size = round(2.4 + innovation_score / 18, 2)
        growth_forecast = round(11 + innovation_score / 8, 2)
        best_countries = self.COUNTRY_PRESETS.get(industry, ["United States", "India", "Singapore"])
        yearly_projection = [
            {"year": 2026, "market_index": round(100 + innovation_score * 0.8, 2)},
            {"year": 2028, "market_index": round(119 + innovation_score * 0.92, 2)},
            {"year": 2030, "market_index": round(141 + innovation_score * 1.05, 2)},
            {"year": 2035, "market_index": round(176 + innovation_score * 1.16, 2)},
        ]
        return {
            "market_size_billion_usd": market_size,
            "growth_forecast_cagr": growth_forecast,
            "best_countries_for_launch": best_countries,
            "yearly_projection": yearly_projection,
            "summary": "The opportunity is strongest in markets with high AI adoption and clear workflow pain points.",
        }
