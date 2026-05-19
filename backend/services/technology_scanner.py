from __future__ import annotations

from services.resource_scanner_service import ResourceScannerService


class TechnologyScanner:
    """Wrapper around resource scanning for technology signals."""

    def scan(self, idea_text: str):
        resources = ResourceScannerService().scan_resources(idea_text)
        return resources.get("related_technologies", [])
