class PitchService:
    """Generate a concise startup pitch from analysis artifacts."""

    def generate(
        self,
        idea_name: str,
        idea_profile: dict,
        market_insights: dict,
        future_impact: dict,
    ) -> dict[str, str]:
        """Return a structured pitch deck narrative."""
        users = ", ".join(idea_profile.get("target_users", [])[:2]) or "innovation teams"
        stack = ", ".join(idea_profile.get("technology_stack", [])[:2]) or "AI workflows"
        countries = ", ".join(market_insights.get("best_countries_for_launch", [])[:2]) or "global early adopters"
        return {
            "problem": idea_profile.get("problem_statement", "Teams struggle to validate bold ideas quickly."),
            "solution": f"{idea_name} gives {users} an intelligence layer for validation, differentiation, and decision support.",
            "market": f"The strongest launch markets are {countries} with a projected CAGR of {market_insights.get('growth_forecast_cagr', 0)}%.",
            "technology": f"The platform combines {stack}, semantic retrieval, and AI-driven scoring to benchmark originality.",
            "business_model": "SaaS subscriptions for founders, hackathon programs, accelerators, and enterprise innovation teams.",
            "future_vision": future_impact.get("outlook", "The product can mature into a strategic operating layer for innovation decisions."),
        }
