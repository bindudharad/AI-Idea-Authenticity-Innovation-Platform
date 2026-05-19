import { searchGithubRepositories } from "@/lib/githubClient";
import { searchPatents } from "@/lib/patentClient";
import { searchWikipedia } from "@/lib/wikipediaClient";

export async function scanResources(keywords: string[]) {
  const topKeywords = keywords.slice(0, 3);
  const [wikipedia, patents, githubRepos] = await Promise.all([
    Promise.all(topKeywords.map((keyword) => searchWikipedia(keyword))),
    Promise.all(topKeywords.map((keyword) => searchPatents(keyword))),
    Promise.all(topKeywords.map((keyword) => searchGithubRepositories(keyword))),
  ]);

  return {
    wikipedia: dedupeBy((item) => item.url, wikipedia.flat()).slice(0, 8),
    patents: dedupeBy((item) => `${item.patentNumber}-${item.title}`, patents.flat()).slice(0, 8),
    githubRepos: dedupeBy((item) => item.url, githubRepos.flat()).slice(0, 8),
  };
}

function dedupeBy<T>(selector: (item: T) => string, items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = selector(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
