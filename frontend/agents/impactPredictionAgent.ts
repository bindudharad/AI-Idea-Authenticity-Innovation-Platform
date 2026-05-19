import { extractIndustries } from "@/utils/keywordExtractor";

export async function runImpactPredictionAgent(input: {
  ideaText: string;
  innovationScore: number;
  similarityScore: number;
}) {
  const industries = extractIndustries(input.ideaText);
  const marketPotential = input.innovationScore >= 75 ? "High" : input.innovationScore >= 55 ? "Medium" : "Emerging";
  const adoptionProbability = Math.max(25, Math.min(92, Math.round((input.innovationScore * 0.65) + 18)));
  const riskLevel = input.similarityScore > 60 ? "Elevated" : input.innovationScore > 70 ? "Moderate" : "Watch";

  return {
    marketPotential: `${marketPotential} in ${industries[0]}`,
    adoptionProbability,
    riskLevel,
  };
}
