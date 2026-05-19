import { analyzeIdea } from "@/engines/ideaAnalysisEngine";

export async function runIdeaAnalysisAgent(input: { ideaText: string }) {
  return analyzeIdea(input.ideaText);
}
