class IdeaAnalysisEngine:
    """Extract a structured understanding of an idea before downstream scoring runs."""

    INDUSTRY_KEYWORDS = {
        "healthcare": ["health", "patient", "clinic", "hospital", "medical", "diagnosis"],
        "fintech": ["finance", "bank", "payment", "fraud", "insurance", "loan"],
        "edtech": ["education", "student", "learning", "school", "teacher", "campus"],
        "climate": ["climate", "energy", "carbon", "sustainability", "waste", "solar"],
        "retail": ["commerce", "retail", "shopping", "inventory", "ecommerce", "customer"],
        "enterprise": ["workflow", "saas", "platform", "operations", "compliance", "analytics"],
        "govtech": ["policy", "government", "municipal", "public", "citizen", "budget"],
    }

    STACK_KEYWORDS = {
        "AI / NLP": ["ai", "llm", "nlp", "language model", "chatbot"],
        "Computer Vision": ["vision", "image", "camera", "ocr", "video"],
        "Predictive Analytics": ["forecast", "prediction", "risk scoring", "recommendation"],
        "Mobile Apps": ["mobile", "android", "ios", "app"],
        "IoT / Edge": ["iot", "sensor", "device", "edge", "wearable"],
        "Cloud APIs": ["api", "platform", "dashboard", "cloud", "workflow"],
        "Blockchain": ["blockchain", "web3", "wallet", "token"],
    }

    AUDIENCE_KEYWORDS = {
        "Students and hackathon teams": ["student", "hackathon", "campus"],
        "Startup founders": ["startup", "founder", "investor", "pitch"],
        "Hospitals and clinicians": ["patient", "clinic", "hospital", "doctor"],
        "Enterprise operators": ["enterprise", "operations", "workflow", "compliance"],
        "Researchers and labs": ["research", "paper", "lab", "academic"],
        "Government organizations": ["government", "public", "citizen", "municipal"],
    }

    RISK_PATTERNS = {
        "Model accuracy and hallucination risk": ["ai", "llm", "prediction", "recommendation"],
        "Data privacy and security requirements": ["health", "finance", "student", "employee", "identity"],
        "Long enterprise sales cycles": ["enterprise", "b2b", "compliance", "platform"],
        "Hardware deployment complexity": ["iot", "sensor", "device", "robotics", "wearable"],
        "Crowded market positioning": ["assistant", "dashboard", "analytics", "marketplace", "platform"],
    }

    def analyze(self, idea_text: str, mode: str) -> dict[str, object]:
        """Build a structured, frontend-friendly view of the idea."""
        normalized = idea_text.lower()
        industry = self._pick_best_match(normalized, self.INDUSTRY_KEYWORDS, fallback="applied ai")
        technology_stack = self._collect_matches(normalized, self.STACK_KEYWORDS, fallback=["AI / NLP", "Cloud APIs"])
        target_users = self._collect_matches(
            normalized,
            self.AUDIENCE_KEYWORDS,
            fallback=["Innovation teams", "Startup founders"] if mode == "business" else ["Hackathon teams", "Student builders"],
        )
        possible_risks = self._collect_matches(
            normalized,
            self.RISK_PATTERNS,
            fallback=["Differentiation may be difficult without a sharp niche", "Execution quality will matter more than feature count"],
        )
        innovation_category = self._innovation_category(normalized, mode)
        problem_statement = self._problem_statement(idea_text, target_users[0], industry)

        return {
            "industry": industry.title(),
            "technology_stack": technology_stack,
            "target_users": target_users,
            "problem_statement": problem_statement,
            "possible_risks": possible_risks[:4],
            "innovation_category": innovation_category,
        }

    def _pick_best_match(self, text: str, patterns: dict[str, list[str]], fallback: str) -> str:
        scored = [(label, sum(1 for token in keywords if token in text)) for label, keywords in patterns.items()]
        scored.sort(key=lambda item: item[1], reverse=True)
        return scored[0][0] if scored and scored[0][1] > 0 else fallback

    def _collect_matches(self, text: str, patterns: dict[str, list[str]], fallback: list[str]) -> list[str]:
        matches = [label for label, keywords in patterns.items() if any(token in text for token in keywords)]
        return matches or fallback

    def _problem_statement(self, idea_text: str, target_user: str, industry: str) -> str:
        snippet = " ".join(idea_text.strip().split()[:18])
        return (
            f"{target_user} need a faster way to validate and improve concepts in {industry} "
            f"without spending weeks on manual research. This idea focuses on: {snippet}."
        )

    def _innovation_category(self, text: str, mode: str) -> str:
        if any(token in text for token in ["predict", "forecast", "simulate"]):
            return "Predictive intelligence platform"
        if any(token in text for token in ["workflow", "automation", "copilot"]):
            return "Operational automation"
        if any(token in text for token in ["marketplace", "community", "network"]):
            return "Network-driven platform"
        return "Startup intelligence suite" if mode == "business" else "Hackathon acceleration suite"
