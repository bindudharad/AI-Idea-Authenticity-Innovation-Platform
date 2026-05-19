import { extractKeywords } from "@/utils/keywordExtractor";

export function extractIdeaKeywords(ideaText: string, seed: string[] = []) {
  return Array.from(new Set([...seed, ...extractKeywords(ideaText).map((item) => item.trim())].filter(Boolean))).slice(0, 12);
}
