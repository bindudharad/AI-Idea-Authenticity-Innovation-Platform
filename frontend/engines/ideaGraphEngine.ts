import { Edge, MarkerType, Node } from "reactflow";

import { IdeaGraphResponse } from "@/types/api";

const TYPE_COLORS: Record<string, string> = {
  idea: "#38bdf8",
  technology: "#8b5cf6",
  startup: "#22c55e",
  research: "#fb923c",
  industry: "#facc15",
  product: "#f472b6",
};

const TYPE_ORDER = ["idea", "technology", "industry", "research", "startup", "product"];

export type IdeaGraphFilters = Record<string, boolean>;

export function createDefaultGraphFilters(): IdeaGraphFilters {
  return {
    idea: true,
    technology: true,
    industry: true,
    research: true,
    startup: true,
    product: true,
  };
}

export function buildIdeaGraphElements(
  graph: IdeaGraphResponse,
  filters: IdeaGraphFilters = createDefaultGraphFilters(),
): { nodes: Node[]; edges: Edge[] } {
  const visibleNodes = graph.nodes.filter((node) => filters[node.type] ?? true);
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = graph.edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
  );

  const grouped = TYPE_ORDER.flatMap((type) => {
    const matches = visibleNodes.filter((node) => node.type === type);
    return matches.map((node, index) => ({ ...node, index, total: matches.length }));
  });

  const nodes: Node[] = grouped.map((node) => ({
    id: node.id,
    type: "default",
    position: getNodePosition(node.type, node.index, node.total),
    draggable: true,
    data: {
      label: node.label,
      description: node.description,
      type: node.type,
    },
    style: {
      borderRadius: 20,
      border: `1px solid ${TYPE_COLORS[node.type] ?? "#94a3b8"}`,
      background: "rgba(15, 23, 42, 0.92)",
      color: "#e2e8f0",
      minWidth: node.type === "idea" ? 220 : 180,
      padding: "14px 16px",
      boxShadow: `0 0 0 1px ${TYPE_COLORS[node.type] ?? "#94a3b8"}22, 0 18px 48px rgba(2, 6, 23, 0.3)`,
      opacity: 0,
      transform: "scale(0.92)",
      transition: `opacity 0.45s ease ${node.index * 0.07}s, transform 0.45s ease ${node.index * 0.07}s`,
      animation: `node-pulse 2.6s ease-in-out ${0.5 + node.index * 0.08}s infinite`,
    },
  }));

  const edges: Edge[] = visibleEdges.map((edge) => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.weight >= 80,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#64748b",
    },
    style: {
      stroke: "#64748b",
      strokeWidth: Math.max(1.5, edge.weight / 22),
      strokeDasharray: "10 10",
      strokeDashoffset: 40,
      animation: `edge-draw 1.1s ease ${Math.max(0, (100 - edge.weight) / 90)}s forwards`,
    },
    labelStyle: {
      fill: "#cbd5e1",
      fontSize: 12,
      fontWeight: 600,
    },
  }));

  return { nodes, edges };
}

function getNodePosition(type: string, index: number, total: number) {
  if (type === "idea") {
    return { x: 0, y: 0 };
  }

  const ringIndex = Math.max(1, TYPE_ORDER.indexOf(type));
  const radius = 220 + ringIndex * 95;
  const angleStep = (2 * Math.PI) / Math.max(total, 1);
  const angleOffset = ringIndex * 0.35;
  const angle = index * angleStep + angleOffset;

  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius),
  };
}

export function getNodeTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#94a3b8";
}
