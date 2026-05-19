"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Cpu, FolderTree } from "lucide-react";

import { AnalyzeIdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

type TreeNode = {
  label: string;
  children?: string[];
};

export function IdeaTreePanel({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const [openNodes, setOpenNodes] = useState<string[]>(["Technology Stack", "Related Signals"]);

  const nodes = useMemo<TreeNode[]>(
    () => [
      {
        label: "Technology Stack",
        children: analysis.idea_profile.technology_stack,
      },
      {
        label: "Related Signals",
        children: analysis.resource_scan.related_technologies.map((item) => String(item.name ?? item.title ?? "Technology")),
      },
      {
        label: "Risk Factors",
        children: analysis.idea_profile.possible_risks,
      },
    ],
    [analysis],
  );

  function toggleNode(label: string) {
    setOpenNodes((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  }

  return (
    <Card className="panel-hover">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
          <FolderTree className="h-5 w-5" />
        </div>
        <div>
          <p className="panel-heading">IdeaTree</p>
          <h2 className="panel-subtitle">Technology knowledge panel</h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {nodes.map((node) => {
          const isOpen = openNodes.includes(node.label);
          return (
            <div key={node.label} className="rounded-[22px] border border-white/10 bg-white/[0.04]">
              <button
                type="button"
                onClick={() => toggleNode(node.label)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-sky-300" />
                  <span className="text-sm font-medium text-white">{node.label}</span>
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              {isOpen ? (
                <div className="border-t border-white/10 px-4 py-4">
                  <div className="space-y-2">
                    {(node.children?.length ? node.children : ["No signals available"]).map((child) => (
                      <div key={`${node.label}-${child}`} className="rounded-[16px] border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
                        {child}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
