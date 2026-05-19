export type AnalyticsResponse = {
  total_ideas: number;
  public_ideas: number;
  average_innovation_score: number;
  latest_similarity_score: number;
  radar_metrics: Record<string, number>;
  trend_analysis: Array<Record<string, string | number>>;
  architecture: {
    nodes: Array<Record<string, string>>;
    edges: Array<Record<string, string>>;
  };
  recent_public_ideas: Array<Record<string, string | number>>;
  market_summary: Record<string, string | number>;
  engine_status: Array<Record<string, string>>;
};
