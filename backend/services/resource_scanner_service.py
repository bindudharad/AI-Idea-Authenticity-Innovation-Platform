class ResourceScannerService:
    """Build a global-resource style scan from the idea profile and similarity matches."""

    def scan(self, idea_profile: dict, similarity_matches: list[dict], mode: str) -> dict[str, list[dict]]:
        """Return grouped resources that feel like patents, papers, startups, and technologies."""
        industry = str(idea_profile.get("industry", "AI")).lower()
        stack = idea_profile.get("technology_stack", [])
        primary_tech = stack[0] if stack else "AI / NLP"

        patents = [
            {
                "title": f"{industry.title()} decision support system for {primary_tech.lower()} workflows",
                "source": "Patent Knowledge Graph",
                "link": f"https://patents.google.com/?q={industry.replace(' ', '+')}+{primary_tech.replace(' ', '+')}",
                "relevance": 72,
                "applicant": f"{industry.title()} Labs",
                "patentNumber": f"US-{abs(hash(industry)) % 900000 + 100000}",
                "filingDate": "2024-01-15",
            },
            {
                "title": f"Automated similarity scoring and innovation benchmarking for {industry.title()} ideas",
                "source": "Patent Landscape",
                "link": "https://patents.google.com/",
                "relevance": 67,
                "applicant": "Innovation Systems Group",
                "patentNumber": f"US-{abs(hash(primary_tech)) % 900000 + 100000}",
                "filingDate": "2023-09-12",
            },
        ]

        research = [
            {
                "title": f"Semantic retrieval systems for {industry.title()} product discovery",
                "source": "Research Archive",
                "link": "https://arxiv.org/",
                "relevance": 76,
                "author": "Research Collective",
                "year": "2024",
            },
            {
                "title": f"Applied {primary_tech} evaluation frameworks for innovation teams",
                "source": "Scholarly Search",
                "link": "https://scholar.google.com/",
                "relevance": 71,
                "author": "AI Strategy Lab",
                "year": "2023",
            },
        ]

        startups = [
            {
                "title": match["title"],
                "source": match["source"],
                "link": "https://www.crunchbase.com/",
                "relevance": round(float(match["similarity_score"]), 2),
            }
            for match in similarity_matches[:3]
        ]

        if not startups:
            startups = [
                {
                    "title": f"{industry.title()} intelligence cloud",
                    "source": "Startup Database",
                    "link": "https://www.crunchbase.com/",
                    "relevance": 64,
                }
            ]

        related_technologies = [
            {"name": primary_tech, "fit": 91, "category": "Core"},
            {"name": "Vector Search", "fit": 87, "category": "Infrastructure"},
            {"name": "Workflow Analytics", "fit": 82, "category": "Intelligence"},
            {"name": "Secure Collaboration", "fit": 79, "category": "Operations"},
        ]

        if mode == "hackathon":
            related_technologies.append({"name": "Rapid prototyping APIs", "fit": 77, "category": "Acceleration"})
        else:
            related_technologies.append({"name": "Enterprise integration layer", "fit": 80, "category": "Enterprise"})

        return {
            "similar_patents": patents,
            "similar_research": research,
            "similar_startups": startups,
            "related_technologies": related_technologies,
        }

    def scan_resources(self, idea_text: str, mode: str = "business") -> dict[str, list[dict]]:
        """Backward-compatible wrapper for older scanner services that only pass raw text."""
        from services.idea_analysis_engine import IdeaAnalysisEngine

        idea_profile = IdeaAnalysisEngine().analyze(idea_text, mode)
        return self.scan(idea_profile, [], mode)
