import { searchGithubRepositories } from "@/lib/githubClient";

export async function runGithubAgent(input: { keywords: string[] }) {
  const results = await Promise.all(input.keywords.slice(0, 3).map((keyword) => searchGithubRepositories(keyword)));
  const flattened = results.flat();
  const seen = new Set<string>();
  return flattened.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  }).slice(0, 8);
}
