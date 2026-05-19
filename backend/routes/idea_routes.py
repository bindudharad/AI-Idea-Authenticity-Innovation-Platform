from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import models
from database.db import get_db
from database.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    FullAnalysisRequest,
    FullAnalysisResponse,
    IdeaGraphRequest,
    IdeaGraphResponse,
    ImpactPredictionResponse,
    IdeaRegistrationRequest,
    IdeaResponse,
    IdeaUpdateRequest,
    InnovationScoreResponse,
    PublicIdeaResponse,
    ResourceScanResponse,
    SimilarityCheckResponse,
    MarketPredictionResponse,
    SuggestionRequest,
    SuggestionResponse,
    TeamNoteCreate,
    TeamWorkspaceResponse,
)
from services.idea_service import IdeaService
from utils.security import get_current_user


router = APIRouter(tags=["Ideas"])


@router.post("/analyze-idea", response_model=AnalysisResponse)
@router.post("/analyze", response_model=AnalysisResponse)
@router.post("/idea/analyze", response_model=AnalysisResponse)
def analyze_idea(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AnalysisResponse:
    """Run similarity detection plus downstream scoring and recommendations for one idea."""
    return IdeaService(db).analyze_idea(payload, current_user)


@router.post("/analyzeIdea", response_model=AnalysisResponse)
def analyze_idea_alias(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AnalysisResponse:
    """CamelCase alias for SaaS clients that expect JavaScript-style route naming."""
    return IdeaService(db).analyze_idea(payload, current_user)


@router.post("/analyze-full", response_model=FullAnalysisResponse)
def analyze_full(
    payload: FullAnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> FullAnalysisResponse:
    """Return the complete AI business ecosystem analysis across all product modules."""
    return IdeaService(db).analyze_full(payload, current_user)


@router.post("/similarityCheck", response_model=SimilarityCheckResponse)
def similarity_check(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> SimilarityCheckResponse:
    """Return the similarity slice of the full analysis pipeline."""
    analysis = IdeaService(db).analyze_idea(payload, current_user)
    return SimilarityCheckResponse(
        similarity_score=analysis.similarity_score,
        similarity_breakdown={
            "top_match": analysis.similarity_score,
            "average_top_matches": round(
                sum(item["similarity_score"] for item in analysis.top_similar_projects) / max(1, len(analysis.top_similar_projects)),
                2,
            ),
        },
        top_similar_projects=analysis.top_similar_projects,
        matching_resources=analysis.resource_scan,
    )


@router.post("/innovationScore", response_model=InnovationScoreResponse)
def innovation_score(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> InnovationScoreResponse:
    """Return the innovation-score slice of the full analysis pipeline."""
    analysis = IdeaService(db).analyze_idea(payload, current_user)
    return InnovationScoreResponse(
        innovation_score=analysis.innovation_score,
        similarity_score=analysis.similarity_score,
        technology_novelty=analysis.innovation_breakdown["technology_novelty"],
        market_uniqueness=analysis.innovation_breakdown["market_uniqueness"],
    )


@router.post("/resourceScanner", response_model=ResourceScanResponse)
def resource_scanner(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ResourceScanResponse:
    """Return structured idea understanding and resource-scan results."""
    analysis = IdeaService(db).analyze_idea(payload, current_user)
    return ResourceScanResponse(idea_profile=analysis.idea_profile, resource_scan=analysis.resource_scan)


@router.post("/marketPrediction", response_model=MarketPredictionResponse)
def market_prediction(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> MarketPredictionResponse:
    """Return market opportunity and competitor intelligence for a submitted idea."""
    analysis = IdeaService(db).analyze_idea(payload, current_user)
    return MarketPredictionResponse(
        market_insights=analysis.market_insights,
        competitor_intelligence=analysis.competitor_intelligence,
    )


@router.post("/impactPrediction", response_model=ImpactPredictionResponse)
def impact_prediction(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ImpactPredictionResponse:
    """Return future impact, simulation, and evolution outputs for a submitted idea."""
    analysis = IdeaService(db).analyze_idea(payload, current_user)
    return ImpactPredictionResponse(
        future_impact=analysis.future_impact,
        impact_simulations=analysis.impact_simulations,
        idea_evolution=analysis.idea_evolution,
    )


@router.post("/ideaGraph", response_model=IdeaGraphResponse)
def idea_graph(
    payload: IdeaGraphRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> IdeaGraphResponse:
    """Generate a node-edge graph showing how an idea connects to technologies, research, and competitors."""
    graph = IdeaService(db).generate_idea_graph(
        idea_name=payload.idea_name,
        idea_description=payload.idea_description,
        mode=payload.mode,
    )
    return IdeaGraphResponse.model_validate(graph)


@router.post("/generate-suggestions", response_model=SuggestionResponse)
def generate_suggestions(
    payload: SuggestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> SuggestionResponse:
    """Return AI-style improvement suggestions without mutating stored records."""
    return IdeaService(db).generate_suggestions(payload.idea_text)


@router.post("/register-idea", response_model=IdeaResponse, status_code=status.HTTP_201_CREATED)
def register_idea(
    payload: IdeaRegistrationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> IdeaResponse:
    """Store a user's idea with privacy controls and ownership metadata."""
    idea = IdeaService(db).register_idea(payload, current_user)
    return IdeaResponse.model_validate(idea)


@router.put("/ideas/{idea_id}", response_model=IdeaResponse)
def update_idea(
    idea_id: int,
    payload: IdeaUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> IdeaResponse:
    """Version an existing idea and update collaboration data."""
    idea = IdeaService(db).update_idea(idea_id, payload, current_user)
    return IdeaResponse.model_validate(idea)


@router.get("/similar-ideas", response_model=list[PublicIdeaResponse])
def get_similar_ideas(
    query: str = Query(..., min_length=5),
    mode: str = Query("startup"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[PublicIdeaResponse]:
    """Search public and dataset-backed ideas by semantic similarity."""
    ideas = IdeaService(db).find_similar_ideas(query=query, mode=mode)
    return [PublicIdeaResponse.model_validate(item) for item in ideas]


@router.get("/community", response_model=list[PublicIdeaResponse])
def get_community_ideas(
    sort_by: str = Query("innovation"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[PublicIdeaResponse]:
    """Return the public idea feed for the community explorer."""
    ideas = IdeaService(db).list_public_ideas(sort_by)
    return [PublicIdeaResponse.model_validate(item) for item in ideas]


@router.get("/ideas", response_model=list[IdeaResponse])
@router.get("/idea/history", response_model=list[IdeaResponse])
def get_user_ideas(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> list[IdeaResponse]:
    """Return ideas owned by the authenticated user so the frontend can show saved work, versions, and workspaces."""
    ideas = IdeaService(db).get_user_ideas(current_user)
    return [IdeaResponse.model_validate(item) for item in ideas]


@router.get("/ideas/{idea_id}", response_model=IdeaResponse)
def get_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> IdeaResponse:
    """Return a single saved idea so modular pages can resolve their current working context."""
    idea = IdeaService(db).get_idea(idea_id, current_user)
    return IdeaResponse.model_validate(idea)


@router.get("/ideas/{idea_id}/full-analysis", response_model=AnalysisResponse)
def get_full_analysis(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AnalysisResponse:
    """Return the canonical backend analysis for a saved idea."""
    return IdeaService(db).analyze_saved_idea(idea_id, current_user)


@router.get("/ideas/{idea_id}/workspace", response_model=TeamWorkspaceResponse)
def get_team_workspace(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> TeamWorkspaceResponse:
    """Fetch collaborators, notes, and comments attached to an idea's team workspace."""
    return IdeaService(db).get_team_workspace(idea_id, current_user)


@router.post("/ideas/{idea_id}/notes", response_model=TeamWorkspaceResponse)
def add_team_note(
    idea_id: int,
    payload: TeamNoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> TeamWorkspaceResponse:
    """Append a workspace note or comment to support team collaboration."""
    return IdeaService(db).add_team_note(idea_id, payload, current_user)


from database.models import AnalysisResult
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class AnalysisResultCreate(BaseModel):
    idea_id: int
    innovation_score: float
    similarity_score: float
    technology_readiness: Optional[float] = 0.0
    market_potential: Optional[float] = 0.0
    ai_summary: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    innovation_highlights: Optional[List[str]] = []

class AnalysisResultResponse(BaseModel):
    id: int
    idea_id: int
    innovation_score: float
    similarity_score: float
    technology_readiness: float
    market_potential: float
    ai_summary: Optional[str]
    problem_statement: Optional[str]
    proposed_solution: Optional[str]
    innovation_highlights: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/analysis-results", response_model=AnalysisResultResponse, status_code=status.HTTP_201_CREATED)
def create_analysis_result(
    payload: AnalysisResultCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Store AI analysis results for an idea."""
    analysis_result = AnalysisResult(
        idea_id=payload.idea_id,
        innovation_score=payload.innovation_score,
        similarity_score=payload.similarity_score,
        technology_readiness=payload.technology_readiness or 0.0,
        market_potential=payload.market_potential or 0.0,
        ai_summary=payload.ai_summary,
        problem_statement=payload.problem_statement,
        proposed_solution=payload.proposed_solution,
        innovation_highlights=payload.innovation_highlights or [],
    )
    db.add(analysis_result)
    db.commit()
    db.refresh(analysis_result)
    return analysis_result


@router.get("/analysis-results/{idea_id}", response_model=List[AnalysisResultResponse])
def get_analysis_results(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Retrieve all AI analysis results for a specific idea."""
    results = db.query(AnalysisResult).filter(AnalysisResult.idea_id == idea_id).order_by(AnalysisResult.created_at.desc()).all()
    return results


@router.get("/ideas/{idea_id}/latest-analysis", response_model=Optional[AnalysisResultResponse])
def get_latest_analysis(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get the most recent AI analysis result for an idea."""
    result = db.query(AnalysisResult).filter(AnalysisResult.idea_id == idea_id).order_by(AnalysisResult.created_at.desc()).first()
    return result


@router.get("/ideas/{idea_id}/certificate")
def download_certificate(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Generate and return an ownership certificate as a downloadable PDF file."""
    path = IdeaService(db).generate_certificate(idea_id, current_user)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Certificate could not be generated")
    return FileResponse(path=path, media_type="application/pdf", filename=path.name)
