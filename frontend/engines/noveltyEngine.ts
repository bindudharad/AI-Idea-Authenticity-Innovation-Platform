import {
  GitHubRepositoryResult,
  NoveltyCheckResponse,
  PatentSearchResult,
  WikipediaSearchResult,
} from "@/types/api";

type IdeaAnalysisInput = {
  keywords?: string[];
  technologies?: string[];
  industries?: string[];
  targetUsers?: string[];
  problems?: string[];
};

export function calculateIdeaNovelty(
  ideaAnalysis: IdeaAnalysisInput | undefined,
  patents: PatentSearchResult[],
  githubRepos: GitHubRepositoryResult[],
  wikipediaResults: WikipediaSearchResult[],
  similarityScoreInput?: number,
): NoveltyCheckResponse {
  const keywords = uniqueNormalized([
    ...(ideaAnalysis?.keywords ?? []),
    ...(ideaAnalysis?.technologies ?? []),
    ...(ideaAnalysis?.industries ?? []),
    ...(ideaAnalysis?.problems ?? []),
  ]);

  const patentSignals = patents.map((patent) => `${patent.title} ${patent.applicant}`);
  const githubSignals = githubRepos.map((repo) => `${repo.name} ${repo.description}`);
  const wikipediaSignals = wikipediaResults.map((entry) => `${entry.title} ${entry.snippet}`);

  const matchedPatents = patents.filter((patent) => matchesSignal(`${patent.title} ${patent.applicant}`, keywords));
  const technologyMentions = collectTechnologyMatches(
    [...githubSignals, ...wikipediaSignals],
    [...(ideaAnalysis?.technologies ?? []), ...(ideaAnalysis?.keywords ?? [])],
  );

  const derivedSimilarity = similarityScoreInput ?? deriveSimilarityScore(keywords, patentSignals, githubSignals, wikipediaSignals);
  const patentOverlap = clamp((matchedPatents.length / Math.max(1, Math.min(6, patents.length || 1))) * 100);
  const technologyOverlap = clamp((technologyMentions.length / Math.max(3, (ideaAnalysis?.technologies?.length ?? 0) + 2)) * 100);
  const competitionDensity = clamp(
    patents.length * 7 + githubRepos.length * 6 + wikipediaResults.length * 4 + patentOverlap * 0.08 + technologyOverlap * 0.06,
  );

  const patentOverlapPenalty = clampDecimal(1 - patentOverlap / 180, 0.45, 1);
  const technologyOverlapPenalty = clampDecimal(1 - technologyOverlap / 220, 0.5, 1);
  const noveltyScore = clamp(
    (100 - derivedSimilarity) * patentOverlapPenalty * technologyOverlapPenalty - competitionDensity * 0.08,
  );

  return {
    noveltyScore,
    noveltyLevel: resolveNoveltyLevel(noveltyScore),
    relatedPatents: matchedPatents.slice(0, 4),
    relatedTechnologies: technologyMentions.slice(0, 6),
    similarityScore: clamp(derivedSimilarity),
    patentOverlap,
    technologyOverlap,
    competitionDensity,
    patentOverlapPenalty,
    technologyOverlapPenalty,
  };
}

function deriveSimilarityScore(
  keywords: string[],
  patents: string[],
  githubSignals: string[],
  wikipediaSignals: string[],
) {
  const patentHits = countHits(patents, keywords);
  const githubHits = countHits(githubSignals, keywords);
  const wikiHits = countHits(wikipediaSignals, keywords);

  return clamp((patentHits * 12 + githubHits * 10 + wikiHits * 7) / Math.max(1, keywords.length));
}

function collectTechnologyMatches(signals: string[], candidates: string[]) {
  const normalizedCandidates = uniqueNormalized(candidates).filter(
    (candidate) => candidate.length > 2 && !GENERIC_TERMS.has(candidate),
  );
  const matches = normalizedCandidates.filter((candidate) =>
    signals.some((signal) => normalizeText(signal).includes(candidate)),
  );

  return matches.map((item) => item.replace(/\b\w/g, (character) => character.toUpperCase()));
}

function countHits(signals: string[], keywords: string[]) {
  return signals.reduce((total, signal) => total + (matchesSignal(signal, keywords) ? 1 : 0), 0);
}

function matchesSignal(signal: string, keywords: string[]) {
  const normalized = normalizeText(signal);
  return keywords.some((keyword) => keyword.length > 2 && normalized.includes(keyword));
}

function uniqueNormalized(items: string[]) {
  return Array.from(new Set(items.map((item) => normalizeText(item)).filter(Boolean)));
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/<[^>]+>/g, " ").replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

const GENERIC_TERMS = new Set([
  "idea",
  "platform",
  "solution",
  "startup",
  "product",
  "user",
  "users",
  "team",
  "teams",
  "founder",
  "founders",
  "market",
  "business",
  "service",
  "helps",
  "help",
  "using",
  "tool",
  "tools",
  "system",
  "systems",
  "farmer",
  "farmers",
]);

function resolveNoveltyLevel(score: number): NoveltyCheckResponse["noveltyLevel"] {
  if (score < 30) {
    return "Common Idea";
  }
  if (score < 60) {
    return "Moderately Innovative";
  }
  if (score < 80) {
    return "Highly Innovative";
  }
  return "Breakthrough Innovation";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function clampDecimal(value: number, min: number, max: number) {
  return Number(Math.max(min, Math.min(max, value)).toFixed(3));
}
