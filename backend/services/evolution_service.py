class EvolutionService:
    """Project how an idea can evolve into stronger versions over time."""

    def roadmap(self, idea_name: str, idea_profile: dict, mode: str) -> list[dict[str, object]]:
        """Create a three-stage product evolution path."""
        audience = ", ".join(idea_profile.get("target_users", [])[:2]) or "early adopters"
        stack = idea_profile.get("technology_stack", ["AI / NLP"])
        return [
            {
                "version": "Version 1",
                "timeframe": "0-6 months",
                "focus": f"Core validation workflow for {audience}",
                "capabilities": ["Idea intake", "Similarity analysis", "Innovation scoring"],
            },
            {
                "version": "Version 2",
                "timeframe": "6-18 months",
                "focus": f"Automation and intelligence layers powered by {stack[0]}",
                "capabilities": ["Competitor intelligence", "Impact prediction", "Market forecasting"],
            },
            {
                "version": "Version 3",
                "timeframe": "18-36 months",
                "focus": f"{idea_name} evolves into a full {'startup OS' if mode == 'business' else 'innovation command center'}",
                "capabilities": ["Scenario simulation", "Pitch generation", "Strategic benchmarking"],
            },
        ]
