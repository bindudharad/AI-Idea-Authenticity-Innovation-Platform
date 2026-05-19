"use client";

import { OpportunityFinder } from "@/components/OpportunityFinder";
import { OpportunityResult } from "@/engines/opportunityFinder";

type InnovationOpportunityFinderProps = {
  data: OpportunityResult;
  onSelectIdea?: (idea: string) => void;
};

export function InnovationOpportunityFinder({ data, onSelectIdea }: InnovationOpportunityFinderProps) {
  return <OpportunityFinder data={data} onSelectIdea={onSelectIdea} />;
}
