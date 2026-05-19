import re
from typing import Any


class IdeaGraphService:
    """Build a graph-shaped view of the innovation ecosystem around one idea."""

    def build_graph(
        self,
        idea_name: str,
        idea_description: str,
        idea_profile: dict[str, Any],
        resource_scan: dict[str, list[dict[str, Any]]],
        similarity_matches: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Create node-edge JSON for the frontend graph visualizer."""
        nodes: list[dict[str, str]] = []
        edges: list[dict[str, Any]] = []

        idea_node = self._add_node(
            nodes,
            label=idea_name,
            node_type="idea",
            description=idea_profile.get("problem_statement", idea_description),
        )

        industry = str(idea_profile.get("industry", "Applied AI")).strip()
        self._connect(
            nodes,
            edges,
            source_id=idea_node["id"],
            label=industry,
            node_type="industry",
            description=f"Primary industry context for this idea: {industry}.",
            weight=88,
        )

        for technology in idea_profile.get("technology_stack", [])[:4]:
            self._connect(
                nodes,
                edges,
                source_id=idea_node["id"],
                label=technology,
                node_type="technology",
                description=f"Core technology used in the concept: {technology}.",
                weight=84,
            )

        for technology in resource_scan.get("related_technologies", [])[:4]:
            name = str(technology.get("name", "Related Technology"))
            fit = float(technology.get("fit", 76))
            self._connect(
                nodes,
                edges,
                source_id=idea_node["id"],
                label=name,
                node_type="technology",
                description=f"Related technology with ecosystem fit score of {fit:.0f}%.",
                weight=fit,
            )

        for paper in resource_scan.get("similar_research", [])[:3]:
            title = str(paper.get("title", "Research Reference"))
            relevance = float(paper.get("relevance", 72))
            self._connect(
                nodes,
                edges,
                source_id=idea_node["id"],
                label=title,
                node_type="research",
                description=f"Research topic related to the idea. Source: {paper.get('source', 'Research')}.",
                weight=relevance,
            )

        for patent in resource_scan.get("similar_patents", [])[:2]:
            title = str(patent.get("title", "Patent Reference"))
            relevance = float(patent.get("relevance", 68))
            self._connect(
                nodes,
                edges,
                source_id=idea_node["id"],
                label=title,
                node_type="research",
                description=f"Patent-style signal related to the concept. Source: {patent.get('source', 'Patent')}.",
                weight=relevance,
            )

        for startup in resource_scan.get("similar_startups", [])[:3]:
            title = str(startup.get("title", "Startup Reference"))
            relevance = float(startup.get("relevance", 70))
            self._connect(
                nodes,
                edges,
                source_id=idea_node["id"],
                label=title,
                node_type="startup",
                description=f"Possible competitor or comparable startup. Source: {startup.get('source', 'Startup Database')}.",
                weight=relevance,
            )

        for product in similarity_matches[:2]:
            self._connect(
                nodes,
                edges,
                source_id=idea_node["id"],
                label=str(product.get("title", "Comparable Product")),
                node_type="product",
                description=str(product.get("description", "Related product signal.")),
                weight=float(product.get("similarity_score", 65)),
            )

        summary = {
            "idea": idea_name,
            "technology_count": len([node for node in nodes if node["type"] == "technology"]),
            "startup_count": len([node for node in nodes if node["type"] == "startup"]),
            "research_count": len([node for node in nodes if node["type"] == "research"]),
            "industry_count": len([node for node in nodes if node["type"] == "industry"]),
            "product_count": len([node for node in nodes if node["type"] == "product"]),
        }

        return {"nodes": nodes, "edges": edges, "summary": summary}

    def _connect(
        self,
        nodes: list[dict[str, str]],
        edges: list[dict[str, Any]],
        source_id: str,
        label: str,
        node_type: str,
        description: str,
        weight: float,
    ) -> None:
        node = self._add_node(nodes, label=label, node_type=node_type, description=description)
        edge_id = f"{source_id}->{node['id']}"
        if any(edge["source"] == source_id and edge["target"] == node["id"] for edge in edges):
            return

        normalized_weight = max(40.0, min(round(weight, 2), 96.0))
        edges.append(
            {
                "source": source_id,
                "target": node["id"],
                "weight": normalized_weight,
                "label": f"{normalized_weight:.0f}%",
                "id": edge_id,
            }
        )

    def _add_node(
        self,
        nodes: list[dict[str, str]],
        label: str,
        node_type: str,
        description: str,
    ) -> dict[str, str]:
        node_id = self._slugify(f"{node_type}-{label}")
        existing = next((node for node in nodes if node["id"] == node_id), None)
        if existing:
            return existing

        node = {
            "id": node_id,
            "label": label.strip(),
            "type": node_type,
            "description": description.strip(),
        }
        nodes.append(node)
        return node

    def _slugify(self, value: str) -> str:
        sanitized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        return sanitized or "node"
