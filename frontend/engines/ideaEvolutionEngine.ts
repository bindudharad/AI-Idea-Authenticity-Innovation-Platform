export type IdeaEvolutionStage = {
  year: number;
  stage: string;
  summary: string;
};

export function simulateIdeaEvolution(input: {
  ideaName: string;
  industries: string[];
  technologies: string[];
  innovationScore: number;
}) {
  const sector = input.industries[0] ?? "AI software";
  const tech = input.technologies[0] ?? "applied AI";
  const maturityTone = input.innovationScore >= 75 ? "scales quickly" : input.innovationScore >= 55 ? "finds product-market fit" : "refines its wedge";

  const stages: IdeaEvolutionStage[] = [
    { year: 2025, stage: "Validation", summary: `${input.ideaName} launches with a focused ${sector} workflow built on ${tech}.` },
    { year: 2030, stage: "Expansion", summary: `The product ${maturityTone} and expands into adjacent use cases with stronger automation.` },
    { year: 2035, stage: "Platformization", summary: `The concept becomes a broader intelligence layer with partner integrations and richer data moats.` },
    { year: 2040, stage: "Ecosystem", summary: `The business operates as an ecosystem platform shaping decision-making across ${sector}.` },
  ];

  return stages;
}
