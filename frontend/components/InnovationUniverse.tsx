"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { readAccessToken } from "@/services/auth-session";
import { getUserIdeas } from "@/services/idea-service";
import { IdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type UniverseNode = {
  id: string;
  ideaName: string;
  innovationScore: number;
  category: string;
  technologies: string[];
  x?: number;
  y?: number;
};

type UniverseLink = {
  source: string;
  target: string;
  similarityScore: number;
};

type GraphData = {
  nodes: UniverseNode[];
  links: UniverseLink[];
};

const categoryPalette: Record<string, string> = {
  AI: "#60a5fa",
  Health: "#34d399",
  Fintech: "#a78bfa",
  Energy: "#fbbf24",
  Default: "#f472b6",
};

function inferCategory(name: string) {
  const value = name.toLowerCase();
  if (value.includes("health") || value.includes("med")) return "Health";
  if (value.includes("fin") || value.includes("bank")) return "Fintech";
  if (value.includes("energy") || value.includes("solar")) return "Energy";
  if (value.includes("ai") || value.includes("ml")) return "AI";
  return "Default";
}

function buildUniverseData(ideas: IdeaResponse[]): GraphData {
  const nodes: UniverseNode[] = ideas.map((entry) => ({
    id: String(entry.id),
    ideaName: entry.title,
    innovationScore: entry.innovation_score,
    category: inferCategory(entry.title),
    technologies: ["AI", ...entry.description.split(" ").slice(0, 2)],
  }));

  const links: UniverseLink[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const diff = Math.abs(nodes[i].innovationScore - nodes[j].innovationScore);
      const similarityScore = Math.max(5, 100 - diff);
      if (similarityScore > 65) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          similarityScore,
        });
      }
    }
  }

  return { nodes, links };
}

export function InnovationUniverse() {
  const [selectedNode, setSelectedNode] = useState<UniverseNode | null>(null);
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const token = readAccessToken();
  const graphData = useMemo(() => buildUniverseData(ideas), [ideas]);

  useEffect(() => {
    let active = true;
    if (!token) {
      return;
    }

    void getUserIdeas(token)
      .then((response) => {
        if (active) {
          setIdeas(response);
        }
      })
      .catch(() => {
        if (active) {
          setIdeas([]);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <Card className="overflow-hidden">
      <p className="panel-heading">Innovation Universe</p>
      <h2 className="panel-subtitle">Galaxy of analyzed ideas</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="h-[460px] rounded-[24px] border border-white/10 bg-black/40">
          <ForceGraph2D
            graphData={graphData}
            nodeCanvasObject={(node: UniverseNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const typedNode = node as UniverseNode;
              const label = typedNode.ideaName;
              const fontSize = 12 / globalScale;
              const radius = Math.max(4, typedNode.innovationScore / 10);
              ctx.beginPath();
              ctx.arc(typedNode.x ?? 0, typedNode.y ?? 0, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = categoryPalette[typedNode.category] ?? categoryPalette.Default;
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.font = `${fontSize}px sans-serif`;
              ctx.fillStyle = "rgba(226,232,240,0.85)";
              ctx.fillText(label, (typedNode.x ?? 0) + radius + 2, typedNode.y ?? 0);
            }}
            linkWidth={(link: UniverseLink) => Math.max(1, ((link as UniverseLink).similarityScore ?? 40) / 50)}
            linkColor={(link: UniverseLink) =>
              (link as UniverseLink).similarityScore > 80 ? "rgba(96,165,250,0.8)" : "rgba(148,163,184,0.35)"
            }
            onNodeClick={(node: UniverseNode) => setSelectedNode(node as UniverseNode)}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected idea</p>
            <p className="mt-3 text-lg font-semibold text-white">{selectedNode?.ideaName ?? "Select a planet"}</p>
            <p className="mt-2 text-sm text-slate-300">
              Innovation Score: {selectedNode ? Math.round(selectedNode.innovationScore) : "--"}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Technologies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(selectedNode?.technologies ?? ["AI", "Automation", "Analytics"]).map((tech) => (
                <span key={tech} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs text-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
            Click a planet to reveal its idea details and technology cluster. The universe connects ideas with high similarity.
          </div>
        </div>
      </div>
    </Card>
  );
}
