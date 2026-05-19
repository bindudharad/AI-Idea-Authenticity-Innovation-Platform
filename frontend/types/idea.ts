export type IdeaType = "startup" | "business";

export type PlatformMode = IdeaType | "hackathon";

export type SimilarIdea = {
  title: string;
  description: string;
  source: string;
  score: number;
};

export type AnalysisSnapshot = {
  ideaName: string;
  mode: PlatformMode;
  similarity: number;
  innovation: number;
  originality: number;
  feasibility: number;
  complexity: number;
  marketPotential: number;
};

export type CommunityIdea = {
  id: number;
  title: string;
  description: string;
  category: string;
  source: string;
  innovation: number;
  popularity: number;
  date: string;
};

export type TrendPoint = {
  technology: string;
  adoption: number;
  momentum: number;
  investment: number;
};
