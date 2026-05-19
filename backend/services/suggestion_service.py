class SuggestionService:
    """Rule-based suggestion engine that mimics structured product coaching."""

    KEYWORD_MAP = {
        "ai": "Add explainability layers so judges and customers can understand model decisions.",
        "resume": "Include role-fit scoring and recruiter insights to make the product more differentiated.",
        "iot": "Consider offline synchronization for edge devices and low-connectivity environments.",
        "health": "Add privacy-preserving analytics and compliance-aware data handling workflows.",
        "education": "Introduce adaptive learning paths and feedback loops for measurable outcomes.",
        "finance": "Highlight fraud monitoring, audit trails, and confidence scoring for enterprise trust.",
    }

    def generate(self, idea_text: str, idea_profile: dict | None = None) -> list[str]:
        """Build targeted improvements from domain keywords plus structured idea context."""
        normalized = idea_text.lower()
        suggestions = [
            "Add predictive analytics so the product goes beyond automation and delivers foresight.",
            "Design a mobile-friendly workflow to make the idea usable during field or event scenarios.",
            "Introduce real-time dashboards with alerts to improve decision making for teams.",
        ]
        for keyword, suggestion in self.KEYWORD_MAP.items():
            if keyword in normalized and suggestion not in suggestions:
                suggestions.append(suggestion)
        if idea_profile:
            audience = ", ".join(idea_profile.get("target_users", [])[:2])
            category = idea_profile.get("innovation_category")
            if audience:
                suggestions.append(f"Create a workflow explicitly tailored for {audience} to sharpen product-market fit.")
            if category:
                suggestions.append(f"Emphasize the {category.lower()} angle in the product story and pitch materials.")
        return suggestions[:5]
