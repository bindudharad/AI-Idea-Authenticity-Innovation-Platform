export function predictIdeaImpact(input: {
  innovationScore: number;
  similarityScore: number;
  industries: string[];
}) {
  const marketPotential =
    input.innovationScore >= 78 ? "High" : input.innovationScore >= 58 ? "Medium" : "Emerging";
  const adoptionProbability = Math.max(24, Math.min(94, Math.round(input.innovationScore * 0.7 + 14)));
  const riskLevel =
    input.similarityScore >= 65 ? "Elevated" : input.innovationScore >= 72 ? "Moderate" : "Watch";

  return {
    marketPotential: `${marketPotential}${input.industries[0] ? ` in ${input.industries[0]}` : ""}`,
    adoptionProbability,
    riskLevel,
  };
}
