class CompetitorService:
    """Translate similarity data into competitor-style intelligence cards."""

    def analyze(self, similarity_matches: list[dict], startup_analysis: dict, mode: str) -> dict[str, object]:
        """Return direct competitors plus a high-level competition assessment."""
        competitors = []
        for index, match in enumerate(similarity_matches[:4], start=1):
            score = float(match.get("similarity_score", 0.0))
            competitors.append(
                {
                    "name": match.get("title", f"Comparable Player {index}"),
                    "source": match.get("source", "Market Intelligence"),
                    "technology_maturity": "Growth" if score < 55 else "Established",
                    "competition_level": "High" if score >= 65 else "Moderate",
                    "differentiator_hint": "Focus on workflow defensibility and measurable ROI.",
                    "similarity_score": round(score, 2),
                }
            )

        competition_level = startup_analysis.get("competition_level", "Moderate")
        if not competitors:
            competitors = [
                {
                    "name": "Whitespace Opportunity",
                    "source": "Internal Signal",
                    "technology_maturity": "Early",
                    "competition_level": "Low",
                    "differentiator_hint": "Use the low-density landscape to define a category wedge.",
                    "similarity_score": 28.0,
                }
            ]
            competition_level = "Low"

        return {
            "competition_level": competition_level,
            "competitors": competitors,
            "market_positioning": (
                "Hackathon-ready differentiation" if mode == "hackathon" else "SaaS wedge with founder-friendly defensibility"
            ),
        }
