from __future__ import annotations

import json
from urllib import error, request

from config import settings


PROJECT_FEATURES = [
    "Idea Analyzer",
    "Similarity Detection",
    "Innovation Score",
    "Resource Engine",
    "Market Prediction",
    "Impact Analysis",
    "Evolution Engine",
    "Investor Logic",
    "Team Workspace",
    "Certificate Generation",
    "Startup Blueprint",
]

PROJECT_PAGES = {
    "dashboard": "/dashboard",
    "analyze": "/analyze",
    "digital twin": "/digital-twin",
    "simulator": "/simulator",
    "mentor": "/mentor",
    "investor": "/investor",
    "global": "/global-analysis",
    "team": "/team-workspace",
    "saved": "/saved-ideas",
    "profile": "/profile",
}

RELATED_KEYWORDS = [
    "idea",
    "analysis",
    "analyze",
    "innovation",
    "similar",
    "similarity",
    "score",
    "resource",
    "blueprint",
    "market",
    "impact",
    "team",
    "workspace",
    "certificate",
    "dashboard",
    "mentor",
    "investor",
    "startup",
    "simulator",
    "digital twin",
    "saved ideas",
]

REFUSAL_MESSAGE = "I can help only with this platform. Please ask about features or usage."


class HelpChatService:
    def answer(self, message: str) -> dict:
        normalized = message.strip()
        if not self._is_project_related(normalized):
          return {"answer": REFUSAL_MESSAGE, "suggested_pages": []}

        suggested_pages = self._suggest_pages(normalized.lower())
        openai_answer = self._query_openai(normalized, suggested_pages)
        if openai_answer:
            return {
                "answer": openai_answer,
                "suggested_pages": suggested_pages,
            }

        return {
            "answer": self._fallback_answer(normalized.lower(), suggested_pages),
            "suggested_pages": suggested_pages,
        }

    def _is_project_related(self, message: str) -> bool:
        lower = message.lower()
        return any(keyword in lower for keyword in RELATED_KEYWORDS)

    def _suggest_pages(self, message: str) -> list[str]:
        pages: list[str] = []
        for keyword, path in PROJECT_PAGES.items():
            if keyword in message:
                pages.append(path)

        if not pages:
            if "blueprint" in message or "analysis" in message:
                pages = ["/analyze", "/dashboard"]
            elif "team" in message or "workspace" in message:
                pages = ["/team-workspace", "/saved-ideas"]
            else:
                pages = ["/dashboard"]

        deduped: list[str] = []
        for page in pages:
            if page not in deduped:
                deduped.append(page)
        return deduped[:3]

    def _query_openai(self, message: str, suggested_pages: list[str]) -> str | None:
        if not settings.openai_api_key:
            return None

        system_prompt = (
            "You are an AI support assistant for an AI Startup Idea Analysis platform. "
            "Only answer questions related to this project. "
            "Explain features, guide users, and help them use the platform. "
            f"If question is unrelated, reply exactly with: {REFUSAL_MESSAGE}. "
            f"The platform features are: {', '.join(PROJECT_FEATURES)}. "
            "Keep answers concise, simple, and action-oriented. "
            "When helpful, mention relevant pages using their paths."
        )

        payload = {
            "model": settings.openai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"User question: {message}\n"
                        f"Relevant pages: {', '.join(suggested_pages) if suggested_pages else 'dashboard'}"
                    ),
                },
            ],
            "temperature": 0.2,
            "max_tokens": 220,
        }

        req = request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.openai_api_key}",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=20) as response:
                body = json.loads(response.read().decode("utf-8"))
            return body["choices"][0]["message"]["content"].strip()
        except (error.URLError, error.HTTPError, KeyError, IndexError, json.JSONDecodeError):
            return None

    def _fallback_answer(self, message: str, suggested_pages: list[str]) -> str:
        page_hint = f" You can start on {suggested_pages[0]}." if suggested_pages else ""

        if "analysis" in message or "analyze" in message:
            return (
                "Idea analysis runs your startup description through the backend pipeline to extract the problem, users, "
                "technology stack, similarity score, innovation score, market signals, and suggestions."
                + page_hint
            )
        if "innovation score" in message or "score" in message:
            return (
                "The innovation score estimates how differentiated your idea is after comparing it with similar ideas, "
                "competition signals, and technology context. Higher scores usually mean stronger originality."
                + page_hint
            )
        if "improve" in message or "better" in message:
            return (
                "Use the Mentor page and Startup Blueprint to improve your idea. They summarize suggestions, action steps, "
                "team structure, launch priorities, and roadmap guidance from the backend analysis."
                + page_hint
            )
        if "blueprint" in message:
            return (
                "The Startup Blueprint turns one analysis into a structured startup plan with problem, solution, users, "
                "roadmap, tech stack, required APIs, team recommendations, cost direction, and pitch summary."
                + page_hint
            )
        if "similar" in message:
            return (
                "To check similar ideas, run analysis first. The platform will show top similar ideas, their source, and "
                "their similarity percentage in the dashboard and similarity cards."
                + page_hint
            )
        if "team" in message or "workspace" in message:
            return (
                "The Team Workspace lets you review saved ideas, version history, members, and notes connected to the backend workspace."
                + page_hint
            )
        return (
            "I can help explain how this platform works, including idea analysis, similarity detection, innovation score, "
            "startup blueprint, investor insights, simulator modules, and team workspace flows."
            + page_hint
        )
