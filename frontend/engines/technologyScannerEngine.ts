import { searchGithubRepositories } from "@/lib/githubClient";

export async function scanTechnologySignals(keywords: string[]) {
  const results = await Promise.all(keywords.slice(0, 3).map((keyword) => searchGithubRepositories(keyword)));
  const seen = new Set<string>();
  return results.flat().filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  }).slice(0, 8);
}
