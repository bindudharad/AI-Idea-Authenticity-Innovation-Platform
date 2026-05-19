class TrendService:
    """Supplies technology trend data for analytics dashboards."""

    def get_trends(self) -> list[dict]:
        """Return chart-ready trend data points."""
        return [
            {"technology": "AI", "momentum": 96, "adoption": 92, "investment": 95},
            {"technology": "IoT", "momentum": 78, "adoption": 84, "investment": 73},
            {"technology": "Blockchain", "momentum": 69, "adoption": 66, "investment": 70},
            {"technology": "Robotics", "momentum": 82, "adoption": 74, "investment": 79},
            {"technology": "Climate Tech", "momentum": 88, "adoption": 72, "investment": 86},
        ]

    def architecture_graph(self) -> dict:
        """Provide a lightweight node/edge graph the frontend can render as a system diagram."""
        return {
            "nodes": [
                {"id": "user", "label": "User"},
                {"id": "frontend", "label": "Next.js Frontend"},
                {"id": "api", "label": "FastAPI Backend"},
                {"id": "idea", "label": "Idea Analysis Engine"},
                {"id": "scanner", "label": "Resource Scanner"},
                {"id": "ai", "label": "Similarity Engine"},
                {"id": "innovation", "label": "Innovation Score Engine"},
                {"id": "impact", "label": "Impact & Market Engines"},
                {"id": "db", "label": "PostgreSQL"},
                {"id": "faiss", "label": "FAISS Index"},
            ],
            "edges": [
                {"source": "user", "target": "frontend"},
                {"source": "frontend", "target": "api"},
                {"source": "api", "target": "idea"},
                {"source": "idea", "target": "scanner"},
                {"source": "scanner", "target": "ai"},
                {"source": "ai", "target": "innovation"},
                {"source": "innovation", "target": "impact"},
                {"source": "api", "target": "db"},
                {"source": "ai", "target": "faiss"},
            ],
        }
