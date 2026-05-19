type FuturePrediction = {
  year: number;
  milestone: string;
  summary: string;
};

type FuturePredictionInput = {
  ideaName: string;
  innovationScore: number;
  industry?: string;
};

export function buildFuturePredictionTimeline(input: FuturePredictionInput): FuturePrediction[] {
  const momentum = Math.max(40, Math.min(95, input.innovationScore));
  const industryLabel = input.industry ? ` in ${input.industry}` : "";

  return [
    {
      year: 2030,
      milestone: "Early adoption",
      summary: `${input.ideaName} reaches pilot deployments${industryLabel} and proves early ROI.`,
    },
    {
      year: 2035,
      milestone: "Market expansion",
      summary: `Expansion into adjacent markets with a stronger data moat and automation workflow.`,
    },
    {
      year: 2040,
      milestone: "Global platform",
      summary: `Global adoption with standardized innovation intelligence tooling and ecosystem partnerships.`,
    },
  ];
}
