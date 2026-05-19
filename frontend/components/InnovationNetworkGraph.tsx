"use client";

import { IdeaGraphVisualizer } from "@/components/IdeaGraphVisualizer";
import { IdeaGraphResponse } from "@/types/api";
import { Skeleton } from "@/ui/skeleton";

type InnovationNetworkGraphProps = {
  graph: IdeaGraphResponse | null;
};

export function InnovationNetworkGraph({ graph }: InnovationNetworkGraphProps) {
  if (!graph) {
    return <Skeleton className="h-[520px] rounded-[28px]" />;
  }
  return <IdeaGraphVisualizer graph={graph} />;
}
