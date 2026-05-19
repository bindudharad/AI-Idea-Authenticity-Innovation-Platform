export function calculateInnovationScore({
  similarityScore,
  technologies,
  competitionCount,
}: {
  similarityScore: number;
  technologies: string[];
  competitionCount: number;
}) {
  const technologyNovelty = Number(Math.min(1.2, 0.8 + technologies.length * 0.06).toFixed(2));
  const competitionPenalty = Math.min(28, competitionCount * 3.5);
  const innovationScore = Math.max(
    0,
    Math.min(100, Number((((100 - similarityScore) * technologyNovelty) - competitionPenalty).toFixed(2))),
  );

  return {
    innovationScore,
    similarityScore,
    competitionLevel: competitionCount >= 6 ? "high" : competitionCount >= 3 ? "medium" : "low",
    technologyNovelty,
    competitionPenalty,
  };
}
