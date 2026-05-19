from dataclasses import dataclass

from ai.embedding_model import EmbeddingModel
from ai.similarity_engine import SimilarityEngine


@dataclass
class SimilarityResult:
    title: str
    description: str
    source: str
    mode: str
    similarity_score: float


class SimilarityService:
    """Coordinates text embedding and vector retrieval."""

    _embedding_model: EmbeddingModel | None = None
    _engine: SimilarityEngine | None = None

    def __init__(self) -> None:
        if self.__class__._embedding_model is None:
            self.__class__._embedding_model = EmbeddingModel()
        if self.__class__._engine is None:
            self.__class__._engine = SimilarityEngine(self.__class__._embedding_model.dimension)
        self.embedding_model = self.__class__._embedding_model
        self.engine = self.__class__._engine

    def search(self, query: str, records: list[dict], limit: int = 5, mode: str | None = None) -> list[SimilarityResult]:
        """Return the top semantically related records, optionally filtered by platform mode."""
        if not records:
            return []

        filtered_records = [item for item in records if not mode or item.get("mode") == mode]
        if not filtered_records:
            filtered_records = records

        query_vector = self.embedding_model.encode(query)
        vectors = [self.embedding_model.encode(item["description"]) for item in filtered_records]
        matches = self.engine.search(query_vector, vectors, top_k=limit)

        results: list[SimilarityResult] = []
        for index, score in matches:
            record = filtered_records[index]
            results.append(
                SimilarityResult(
                    title=record["title"],
                    description=record["description"],
                    source=record["source"],
                    mode=record["mode"],
                    similarity_score=round(score * 100, 2),
                )
            )
        return results
