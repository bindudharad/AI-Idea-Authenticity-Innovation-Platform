import { cleanText } from "@/utils/textCleaner";

const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is", "it", "of", "on", "or",
  "that", "the", "their", "this", "to", "using", "with", "your", "users", "platform", "idea", "system", "tool",
]);

const technologyLexicon = [
  "AI", "NLP", "LLM", "Computer Vision", "Analytics", "Vector Search", "Automation", "API", "Machine Learning",
  "Workflow", "Cloud", "Mobile", "Blockchain", "IoT", "Predictive Modeling", "Recommendation Engine",
];

const industryLexicon = [
  "Fintech", "EdTech", "HealthTech", "GovTech", "ClimateTech", "Cybersecurity", "Enterprise SaaS", "Retail",
  "Research", "Developer Tools", "Productivity",
];

export function extractKeywords(text: string, maxItems = 8): string[] {
  const cleaned = cleanText(text).toLowerCase();
  const counts = new Map<string, number>();

  for (const token of cleaned.split(/[^a-z0-9]+/)) {
    if (!token || token.length < 4 || stopWords.has(token)) {
      continue;
    }
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, maxItems)
    .map(([keyword]) => keyword);
}

export function extractTechnologies(text: string): string[] {
  const cleaned = cleanText(text).toLowerCase();
  const matches = technologyLexicon.filter((technology) => cleaned.includes(technology.toLowerCase()));
  return matches.length > 0 ? matches : ["AI", "Analytics"];
}

export function extractIndustries(text: string): string[] {
  const cleaned = cleanText(text).toLowerCase();
  const matches = industryLexicon.filter((industry) => cleaned.includes(industry.toLowerCase()));
  return matches.length > 0 ? matches : ["Innovation Platforms"];
}

export function extractProblemStatements(text: string): string[] {
  const cleaned = cleanText(text);
  const sentences = cleaned.split(/[.!?]/).map((sentence) => sentence.trim()).filter(Boolean);
  return sentences.slice(0, 3);
}
