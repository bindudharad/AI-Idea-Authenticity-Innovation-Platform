class JudgingService:
    """Evaluates hackathon and startup submissions using multi-criterion, explainable rubrics."""

    def score(
        self,
        idea_text: str,
        innovation_score: float,
        idea_profile: dict | None = None,
        startup_analysis: dict | None = None,
    ) -> dict[str, float | str | list[str]]:
        """
        Return calibrated 1.0 - 10.0 judging scores across 4 key hackathon criteria:
        1. Innovation & Novelty (25%)
        2. Technical Depth & Architecture (35%)
        3. Real-World Impact & Problem Urgency (25%)
        4. Execution Feasibility & MVP Scope (15%)
        """
        # 1. Innovation score (1-10)
        innovation = min(10.0, max(2.0, innovation_score / 10.0))

        # 2. Technical Complexity (1-10) - based on stack & architectural signals
        tech_base = 5.0
        if idea_profile:
            stack = idea_profile.get("technology_stack", [])
            tech_base += min(4.0, len(stack) * 0.9)
            # Detect advanced tech keywords
            adv_keywords = ["ai", "neural", "distributed", "ebpf", "quantum", "zk", "zero-knowledge", "pipeline", "real-time", "sensor", "vision"]
            matched_adv = sum(1 for kw in adv_keywords if kw in idea_text.lower())
            tech_base += min(1.0, matched_adv * 0.3)
        else:
            # Fallback heuristic based on specific technical terminology density
            tokens = set(idea_text.lower().split())
            tech_indicators = {"api", "algorithm", "model", "database", "cloud", "security", "pipeline", "vector", "agent"}
            tech_base += min(3.5, len(tokens.intersection(tech_indicators)) * 0.7)

        technical_complexity = min(10.0, max(3.0, tech_base))

        # 3. Real-World Impact (1-10)
        impact_base = 5.5
        if startup_analysis:
            market_size = startup_analysis.get("target_market", "")
            if any(term in market_size.lower() for term in ["global", "enterprise", "healthcare", "infrastructure", "critical"]):
                impact_base += 2.5
            else:
                impact_base += 1.5
        impact_base += min(2.0, (innovation_score / 50.0))
        real_world_impact = min(10.0, max(3.0, impact_base))

        # 4. Feasibility (1-10)
        features = idea_profile.get("key_features", []) if idea_profile else []
        feasibility_base = 7.0 if len(features) >= 2 else 6.0
        # If technical complexity is exceptionally high, feasibility requires tighter scope
        if technical_complexity > 8.5:
            feasibility_base -= 0.5
        feasibility = min(10.0, max(3.0, feasibility_base))

        # Weighted overall composite
        overall = round(
            (innovation * 0.25)
            + (technical_complexity * 0.35)
            + (real_world_impact * 0.25)
            + (feasibility * 0.15),
            2,
        )

        feedback = []
        if innovation >= 7.5:
            feedback.append("Strong novelty and differentiated value proposition.")
        else:
            feedback.append("Consider narrowing the niche or introducing proprietary technical moats.")

        if technical_complexity >= 7.0:
            feedback.append("Well-defined technical architecture and credible technical foundation.")
        else:
            feedback.append("Clarify the core algorithmic or engineering implementation details.")

        if real_world_impact >= 7.5:
            feedback.append("Clear alignment with a sizeable, high-value problem domain.")

        return {
            "innovation": round(innovation, 2),
            "technical_complexity": round(technical_complexity, 2),
            "real_world_impact": round(real_world_impact, 2),
            "feasibility": round(feasibility, 2),
            "overall": overall,
            "feedback": feedback,
        }
