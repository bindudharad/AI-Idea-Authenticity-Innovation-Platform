from __future__ import annotations

from services.impact_simulation_service import ImpactSimulationService


class ImpactSimulationEngine:
    """Compatibility wrapper for impact simulation requests."""

    def simulate(self, analysis):
        return ImpactSimulationService().simulate(analysis)
