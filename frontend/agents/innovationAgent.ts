import { calculateInnovationScore } from "@/engines/innovationEngine";

export async function runInnovationAgent(input: {
  similarityScore: number;
  technologies: string[];
  competitionCount: number;
}) {
  return calculateInnovationScore(input);
}
