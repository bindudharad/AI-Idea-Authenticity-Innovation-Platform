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
        """Return the top semantically related records using persistent FAISS vector search."""
        if not query.strip():
            return []

        # Ensure index is built and persisted once rather than re-encoding on every query
        if records:
            self.engine.ensure_indexed(records, self.embedding_model)

        query_vector = self.embedding_model.encode(query)
        matches = self.engine.search_with_filter(query_vector, top_k=limit, mode=mode)

        # Fallback if engine had no matches or index was empty
        if not matches and records:
            filtered_records = [item for item in records if not mode or item.get("mode") == mode]
            if not filtered_records:
                filtered_records = records
            vectors = [self.embedding_model.encode(item["description"]) for item in filtered_records]
            raw_matches = self.engine.search(query_vector, vectors, top_k=limit)
            matches = [(filtered_records[idx], score) for idx, score in raw_matches]

        results: list[SimilarityResult] = []
        for record, score in matches:
            results.append(
                SimilarityResult(
                    title=record["title"],
                    description=record["description"],
                    source=record["source"],
                    mode=record.get("mode", mode or "business"),
                    similarity_score=round(float(score) * 100, 2),
                )
            )
        return results
