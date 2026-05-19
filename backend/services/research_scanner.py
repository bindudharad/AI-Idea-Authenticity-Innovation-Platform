from __future__ import annotations

from services.resource_scanner_service import ResourceScannerService


class ResearchScanner:
    """Wrapper around resource scanning for research-specific extraction."""

    def scan(self, idea_text: str):
        resources = ResourceScannerService().scan_resources(idea_text)
        return resources.get("similar_research", [])
