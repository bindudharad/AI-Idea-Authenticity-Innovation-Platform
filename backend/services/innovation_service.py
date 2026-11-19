class InnovationService:
    """Encapsulates multi-dimensional scoring logic across novelty, tech depth, and market fit."""

    @staticmethod
    def calculate_innovation_score(
        top_similarity: float,
        idea_profile: dict | None = None,
        startup_analysis: dict | None = None,
    ) -> float:
        """
        Calculate an empirical multi-factor innovation score [0-100] incorporating:
        1. Novelty (semantic distance from closest existing benchmark): 40%
        2. Technical depth & modern architecture: 25%
        3. Market differentiation & competitive landscape: 20%
        4. Problem specificity & execution feasibility: 15%
        """
        # Novelty component (0-100)
        novelty_score = max(5.0, 100.0 - top_similarity)

        # Technical depth component (0-100)
        tech_score = 65.0
        if idea_profile:
            stack = idea_profile.get("technology_stack", [])
            tech_count = len(stack)
            tech_score = min(98.0, 50.0 + tech_count * 10.0)

        # Market differentiation component (0-100)
        market_score = 70.0
        if startup_analysis:
            comp_level = startup_analysis.get("competition_level", "Moderate")
            if comp_level == "Low":
                market_score = 88.0
            elif comp_level == "High":
                market_score = 55.0

        # Feasibility & specificity component (0-100)
        feasibility_score = 75.0
        if idea_profile:
            features = idea_profile.get("key_features", [])
            feasibility_score = min(95.0, 60.0 + len(features) * 7.0)

        # Weighted composite score
        composite = (
            novelty_score * 0.40
            + tech_score * 0.25
            + market_score * 0.20
            + feasibility_score * 0.15
        )
        return round(min(99.0, max(10.0, composite)), 2)

    @staticmethod
    def originality_breakdown(innovation_score: float) -> dict[str, float]:
        """Create chart-friendly radar metrics for the frontend analytics dashboard."""
        originality = min(98.0, max(15.0, innovation_score))
        feasibility = min(95.0, max(35.0, 50.0 + innovation_score * 0.38))
        complexity = min(94.0, max(30.0, 45.0 + innovation_score * 0.35))
        market_potential = min(96.0, max(40.0, 52.0 + innovation_score * 0.36))
        return {
            "originality": round(originality, 2),
            "feasibility": round(feasibility, 2),
            "complexity": round(complexity, 2),
            "market_potential": round(market_potential, 2),
        }

    @staticmethod
    def score_breakdown(similarity_score: float, idea_profile: dict, startup_analysis: dict) -> dict[str, float]:
        """Explain the innovation score using novelty, similarity, and market context."""
        stack = idea_profile.get("technology_stack", [])
        technology_novelty = min(95.0, 60.0 + len(stack) * 9.0 - similarity_score * 0.1)
        comp_level = startup_analysis.get("competition_level", "Moderate")
        market_uniqueness = 85.0 if comp_level == "Low" else 72.0 if comp_level == "Moderate" else 55.0

        composite_score = InnovationService.calculate_innovation_score(
            similarity_score,
            idea_profile=idea_profile,
            startup_analysis=startup_analysis,
        )

        return {
            "similarity_score": round(similarity_score, 2),
            "technology_novelty": round(max(10.0, technology_novelty), 2),
            "market_uniqueness": round(max(10.0, market_uniqueness), 2),
            "innovation_score": composite_score,
        }
