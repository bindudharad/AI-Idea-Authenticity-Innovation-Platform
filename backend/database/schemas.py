from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class AnalysisRequest(BaseModel):
    idea_name: str = Field(..., min_length=3, max_length=255)
    idea_text: str = Field(..., min_length=12)
    mode: str = Field(default="startup", pattern="^(startup|business|hackathon)$")
    idea_type: str | None = Field(default=None, pattern="^(startup|business|hackathon)$")


class SuggestionRequest(BaseModel):
    idea_text: str = Field(..., min_length=12)


class SuggestionResponse(BaseModel):
    suggestions: list[str]


class FullAnalysisRequest(BaseModel):
    idea: str = Field(..., min_length=12)
    idea_name: str = Field(default="Business concept", min_length=3, max_length=255)
    idea_type: str = Field(default="startup", pattern="^(startup|business|hackathon)$")
    location: dict[str, Any] = Field(default_factory=dict)


class FullAnalysisResponse(BaseModel):
    idea_engine: dict[str, Any]
    location_intelligence: dict[str, Any]
    competitor_engine: dict[str, Any]
    financial_engine: dict[str, Any]
    funding_engine: dict[str, Any]
    business_blueprint: dict[str, Any]
    growth_engine: dict[str, Any]
    recommendation_ai: dict[str, Any]
    source_analysis: dict[str, Any]


class SimilarityCheckResponse(BaseModel):
    similarity_score: float
    similarity_breakdown: dict[str, float]
    top_similar_projects: list[dict[str, Any]]
    matching_resources: dict[str, Any]


class InnovationScoreResponse(BaseModel):
    innovation_score: float
    similarity_score: float
    technology_novelty: float
    market_uniqueness: float


class ResourceScanResponse(BaseModel):
    idea_profile: dict[str, Any]
    resource_scan: dict[str, Any]


class MarketPredictionResponse(BaseModel):
    market_insights: dict[str, Any]
    competitor_intelligence: dict[str, Any]


class ImpactPredictionResponse(BaseModel):
    future_impact: dict[str, Any]
    impact_simulations: list[dict[str, Any]]
    idea_evolution: list[dict[str, Any]]


class IdeaGraphRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    idea_name: str = Field(..., alias="ideaName", min_length=3, max_length=255)
    idea_description: str = Field(..., alias="ideaDescription", min_length=12)
    mode: str = Field(default="hackathon", pattern="^(hackathon|business)$")


class IdeaGraphNode(BaseModel):
    id: str
    label: str
    type: str
    description: str


class IdeaGraphEdge(BaseModel):
    source: str
    target: str
    weight: float = Field(..., ge=0, le=100)
    label: str


class IdeaGraphResponse(BaseModel):
    nodes: list[IdeaGraphNode]
    edges: list[IdeaGraphEdge]
    summary: dict[str, Any]


class AnalysisResponse(BaseModel):
    idea_name: str
    mode: str
    idea_type: str
    similarity_score: float
    innovation_score: float
    copy_claim_warning: str
    top_similar_projects: list[dict[str, Any]]
    idea_profile: dict[str, Any]
    resource_scan: dict[str, Any]
    innovation_breakdown: dict[str, float]
    suggestions: list[str]
    judging_scores: dict[str, float]
    startup_analysis: dict[str, Any]
    business_analysis: dict[str, Any] = Field(default_factory=dict)
    future_impact: dict[str, Any]
    competitor_intelligence: dict[str, Any]
    market_insights: dict[str, Any]
    idea_evolution: list[dict[str, Any]]
    impact_simulations: list[dict[str, Any]]
    pitch: dict[str, str]
    recommended_stack: dict[str, str]
    architecture: dict[str, Any]
    radar_metrics: dict[str, float]
    analyzed_for: str


class IdeaRegistrationRequest(BaseModel):
    idea_name: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=12)
    mode: str = Field(default="startup", pattern="^(startup|business|hackathon)$")
    idea_type: str | None = Field(default=None, pattern="^(startup|business|hackathon)$")
    is_public: bool = False


class IdeaUpdateRequest(BaseModel):
    description: str | None = Field(default=None, min_length=12)
    is_public: bool | None = None


class IdeaVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    version_number: int
    description: str
    innovation_score: float
    created_at: datetime


class IdeaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    mode: str
    is_public: bool
    innovation_score: float
    latest_similarity_score: float
    created_at: datetime
    updated_at: datetime
    versions: list[IdeaVersionResponse] = Field(default_factory=list)


class PublicIdeaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
    description: str
    mode: str
    source: str = "Community Submission"
    innovation_score: float = 0.0
    similarity_score: float = 0.0


class TeamNoteCreate(BaseModel):
    content: str = Field(..., min_length=2)


class TeamWorkspaceResponse(BaseModel):
    team_name: str
    members: list[dict[str, Any]]
    notes: list[dict[str, Any]]


class AnalyticsResponse(BaseModel):
    total_ideas: int
    public_ideas: int
    average_innovation_score: float
    latest_similarity_score: float
    radar_metrics: dict[str, float]
    trend_analysis: list[dict[str, Any]]
    architecture: dict[str, Any]
    recent_public_ideas: list[dict[str, Any]]
    market_summary: dict[str, Any]
    engine_status: list[dict[str, str]]


class HelpChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=1500)


class HelpChatResponse(BaseModel):
    answer: str
    suggested_pages: list[str] = Field(default_factory=list)
