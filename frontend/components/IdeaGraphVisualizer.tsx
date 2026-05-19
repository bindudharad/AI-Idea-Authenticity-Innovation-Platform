"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import {
  buildIdeaGraphElements,
  createDefaultGraphFilters,
  getNodeTypeColor,
  type IdeaGraphFilters,
} from "@/engines/ideaGraphEngine";
import { IdeaGraphResponse } from "@/types/api";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

import "reactflow/dist/style.css";

type IdeaGraphVisualizerProps = {
  graph: IdeaGraphResponse;
};

type GraphNodeData = {
  label: string;
  description: string;
  type: string;
};

const nodeTypeLabels: Array<{ key: keyof IdeaGraphFilters; label: string }> = [
  { key: "idea", label: "Idea" },
  { key: "technology", label: "Technology" },
  { key: "industry", label: "Industry" },
  { key: "research", label: "Research" },
  { key: "startup", label: "Startup" },
  { key: "product", label: "Product" },
];

export function IdeaGraphVisualizer({ graph }: IdeaGraphVisualizerProps) {
  const [filters, setFilters] = useState<IdeaGraphFilters>(() => createDefaultGraphFilters());
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildIdeaGraphElements(graph, filters),
    [graph, filters],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode((current) => {
      if (!current) {
        return null;
      }
      return initialNodes.find((node) => node.data.label === current.label)?.data ?? null;
    });

    const reveal = window.setTimeout(() => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            opacity: 1,
            transform: "scale(1)",
          },
        })),
      );
    }, 80);

    return () => window.clearTimeout(reveal);
  }, [initialEdges, initialNodes, setEdges, setNodes]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden p-0">
        <GraphToolbar filters={filters} onFilterToggle={setFilters} />
        <div className="h-[680px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            minZoom={0.35}
            maxZoom={1.8}
            onNodeClick={(_, node) => setSelectedNode(node.data as GraphNodeData)}
            onNodeMouseEnter={(_, node) => setSelectedNode(node.data as GraphNodeData)}
          >
            <MiniMap
              zoomable
              pannable
              nodeColor={(node) => getNodeTypeColor(String(node.data?.type ?? "idea"))}
              maskColor="rgba(2, 6, 23, 0.55)"
              className="!rounded-2xl !border !border-white/10 !bg-slate-950/90"
            />
            <Controls className="!rounded-2xl !border !border-white/10 !bg-slate-950/90" />
            <Background color="#1e293b" gap={24} size={1.2} />
            <GraphActions />
          </ReactFlow>
        </div>
      </Card>

      <Card>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Node intelligence</p>
        {selectedNode ? (
          <>
            <div className="mt-5 flex items-center gap-3">
              <span
                className="inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: getNodeTypeColor(String(selectedNode.type)) }}
              />
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                {String(selectedNode.type)}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">{String(selectedNode.label)}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{String(selectedNode.description)}</p>
          </>
        ) : (
          <p className="mt-5 text-sm leading-7 text-slate-300">
            Hover or click any node in the graph to inspect its role in the innovation ecosystem.
          </p>
        )}

        <div className="mt-8 grid gap-3">
          {nodeTypeLabels.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex h-3 w-3 rounded-full"
                  style={{ backgroundColor: getNodeTypeColor(item.key) }}
                />
                <span className="text-sm text-slate-200">{item.label}</span>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {graph.nodes.filter((node) => node.type === item.key).length}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function GraphToolbar({
  filters,
  onFilterToggle,
}: {
  filters: IdeaGraphFilters;
  onFilterToggle: (updater: IdeaGraphFilters | ((current: IdeaGraphFilters) => IdeaGraphFilters)) => void;
}) {
  return (
    <div className="border-b border-white/10 bg-slate-950/70 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Idea Graph Viewer</p>
          <p className="mt-1 text-sm text-slate-400">
            Zoom, drag, and filter the global ecosystem connected to the current idea.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {nodeTypeLabels.map((item) => {
            const active = filters[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  onFilterToggle((current) => ({
                    ...current,
                    [item.key]: !current[item.key],
                  }))
                }
                className={`rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition ${
                  active
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-transparent text-slate-500"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GraphActions() {
  const reactFlow = useReactFlow();

  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <Button size="sm" variant="secondary" onClick={() => reactFlow.zoomIn()}>
        <ZoomIn className="h-4 w-4" />
        Zoom
      </Button>
      <Button size="sm" variant="secondary" onClick={() => reactFlow.zoomOut()}>
        <ZoomOut className="h-4 w-4" />
        Zoom Out
      </Button>
      <Button size="sm" variant="secondary" onClick={() => reactFlow.fitView({ padding: 0.18 })}>
        <RotateCcw className="h-4 w-4" />
        Reset View
      </Button>
    </div>
  );
}
