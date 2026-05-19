import { generateEmbeddings } from "@/lib/huggingfaceClient";
import { cosineSimilarity } from "@/utils/vectorSimilarity";

type SimilarityCandidate = {
  id: string;
  title: string;
  text: string;
  source: string;
  url?: string;
};

export async function runSimilarityCheck(ideaText: string, candidates: SimilarityCandidate[]) {
  if (candidates.length === 0) {
    return {
      similarityScore: 0,
      closestMatches: [],
    };
  }

  let embeddings: number[][] = [];
  try {
    embeddings = await generateEmbeddings([ideaText, ...candidates.map((candidate) => candidate.text)]);
  } catch {
    embeddings = [];
  }
  const [ideaEmbedding, ...candidateEmbeddings] = embeddings;
  const ideaKeywords = extractKeywords(ideaText);
  const ideaPhrases = extractPhrases(ideaText);

  const closestMatches = candidates
    .map((candidate, index) => ({
      ...candidate,
      similarity: computeHybridSimilarity(
        ideaEmbedding ?? [],
        candidateEmbeddings[index] ?? [],
        ideaKeywords,
        extractKeywords(candidate.text),
        ideaPhrases,
        extractPhrases(candidate.text),
      ),
    }))
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 8);

  const similarityScore =
    closestMatches.length > 0
      ? Number(
          (
            closestMatches.reduce((sum, item) => sum + item.similarity, 0) /
            closestMatches.length
          ).toFixed(2),
        )
      : 0;

  return {
    similarityScore,
    closestMatches,
  };
}

function computeHybridSimilarity(
  ideaEmbedding: number[],
  candidateEmbedding: number[],
  ideaKeywords: string[],
  candidateKeywords: string[],
  ideaPhrases: string[],
  candidatePhrases: string[],
) {
  const embeddingScore =
    ideaEmbedding.length > 0 && candidateEmbedding.length > 0
      ? Math.max(0, cosineSimilarity(ideaEmbedding, candidateEmbedding)) * 100
      : 0;
  const keywordScore = keywordOverlapScore(ideaKeywords, candidateKeywords) * 100;
  const phraseScore = phraseOverlapScore(ideaPhrases, candidatePhrases) * 100;

  const total =
    embeddingScore > 0
      ? embeddingScore * 0.6 + keywordScore * 0.25 + phraseScore * 0.15
      : keywordScore * 0.7 + phraseScore * 0.3;

  return Number(total.toFixed(2));
}

function keywordOverlapScore(left: string[], right: string[]) {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }
  const rightSet = new Set(right);
  const overlap = left.filter((keyword) => rightSet.has(keyword)).length;
  return overlap / Math.max(left.length, right.length);
}

function extractKeywords(text: string) {
  return tokenize(text).filter((token) => token.length > 3).slice(0, 20);
}

function extractPhrases(text: string) {
  const tokens = tokenize(text);
  const phrases: string[] = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return phrases.slice(0, 16);
}

function phraseOverlapScore(left: string[], right: string[]) {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }
  const rightSet = new Set(right);
  const overlap = left.filter((phrase) => rightSet.has(phrase)).length;
  return overlap / Math.max(left.length, right.length);
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}
