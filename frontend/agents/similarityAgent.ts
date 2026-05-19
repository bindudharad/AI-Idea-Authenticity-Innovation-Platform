import { runSimilarityCheck } from "@/engines/similarityEngine";

export async function runSimilarityAgent(input: {
  ideaText: string;
  wikipedia: Array<{ title: string; snippet: string; pageid: number; url: string }>;
  patents: Array<{ title: string; applicant: string; patentNumber: string; filingDate: string }>;
  githubRepos: Array<{ name: string; description: string; stars: number; url: string }>;
}) {
  const candidates = [
    ...input.wikipedia.map((item) => ({
      id: `wiki-${item.pageid}`,
      title: item.title,
      text: `${item.title}. ${item.snippet}`,
      source: "Wikipedia",
      url: item.url,
    })),
    ...input.patents.map((item) => ({
      id: `patent-${item.patentNumber}`,
      title: item.title,
      text: `${item.title}. ${item.applicant}. ${item.filingDate}`,
      source: "USPTO",
    })),
    ...input.githubRepos.map((item) => ({
      id: `github-${item.url}`,
      title: item.name,
      text: `${item.name}. ${item.description}`,
      source: "GitHub",
      url: item.url,
    })),
  ];

  return runSimilarityCheck(input.ideaText, candidates);
}
