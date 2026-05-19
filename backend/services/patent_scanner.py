from __future__ import annotations

from services.resource_scanner_service import ResourceScannerService


class PatentScanner:
    """Wrapper around resource scanning for patent-specific extraction."""

    def scan(self, idea_text: str):
        resources = ResourceScannerService().scan_resources(idea_text)
        return resources.get("similar_patents", [])
