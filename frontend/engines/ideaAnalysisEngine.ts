import { analyzeIdeaWithGroq } from "@/lib/groqClient";
import { extractIndustries, extractKeywords, extractProblemStatements, extractTechnologies } from "@/utils/keywordExtractor";

export async function analyzeIdea(ideaText: string) {
  const groq = await analyzeIdeaWithGroq(ideaText);
  const domain = detectDomain(ideaText, groq.industries);
  const innovationConcepts = extractInnovationConcepts(ideaText, groq.keywords);

  return {
    keywords: unique([...groq.keywords, ...extractKeywords(ideaText)]),
    technologies: unique([...groq.technologies, ...extractTechnologies(ideaText)]),
    industries: unique([...groq.industries, ...extractIndustries(ideaText)]),
    domain,
    innovationConcepts,
    targetUsers: unique(groq.targetUsers),
    problems: unique([...groq.problems, ...extractProblemStatements(ideaText)]),
    provider: groq.provider,
  };
}

function unique(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))].slice(0, 8);
}

function detectDomain(text: string, industries: string[]) {
  const lower = text.toLowerCase();
  const hints = industries.join(" ").toLowerCase();
  const domainMap: Array<{ label: string; keywords: string[] }> = [
    { label: "Startup innovation tools", keywords: ["startup", "founder", "idea", "innovation", "validation"] },
    { label: "AI research intelligence", keywords: ["research", "paper", "academic", "arxiv", "knowledge"] },
    { label: "Fintech systems", keywords: ["fintech", "bank", "credit", "risk"] },
    { label: "HealthTech", keywords: ["health", "medical", "patient", "diagnosis"] },
    { label: "Climate tech", keywords: ["climate", "sustainability", "energy", "carbon"] },
  ];

  const match = domainMap.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword) || hints.includes(keyword)),
  );

  return match?.label ?? (industries[0] ? `${industries[0]} solutions` : "Emerging innovation domain");
}

function extractInnovationConcepts(text: string, keywords: string[]) {
  const base = [
    "platform",
    "engine",
    "marketplace",
    "automation",
    "optimization",
    "prediction",
    "insights",
    "analytics",
    "recommendation",
    "orchestration",
    "personalization",
    "verification",
    "simulation",
  ];

  const signals = new Set<string>();
  const lower = text.toLowerCase();

  base.forEach((term) => {
    if (lower.includes(term)) {
      signals.add(`${term} system`);
    }
  });

  keywords
    .filter((keyword) => keyword.length > 3)
    .slice(0, 10)
    .forEach((keyword) => signals.add(`${keyword} innovation`));

  if (signals.size === 0) {
    signals.add("AI-enabled decision support");
    signals.add("data-driven innovation intelligence");
  }

  return unique([...signals]);
}
