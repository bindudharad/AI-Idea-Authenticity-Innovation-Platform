import json
from pathlib import Path

import numpy as np

from config import settings
from utils.logger import get_logger


logger = get_logger(__name__)


class SimilarityEngine:
    """Store vectors and retrieve top similar ideas with FAISS cosine search."""

    def __init__(self, dimension: int, index_path: str | None = None, metadata_path: str | None = None) -> None:
        self.dimension = dimension
        self.index_path = Path(index_path or settings.faiss_index_path)
        self.metadata_path = Path(metadata_path or settings.faiss_metadata_path)
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.metadata_path.parent.mkdir(parents=True, exist_ok=True)
        self._faiss = None
        self.index = None
        self.metadata: list[dict] = []
        try:
            import faiss

            self._faiss = faiss
        except Exception as exc:  # pragma: no cover - optional runtime dependency fallback
            logger.warning("FAISS unavailable, using NumPy fallback: %s", exc)
        self._load_from_disk()

    def _create_index(self):
        """Create an inner-product index for normalized cosine similarity."""
        if self._faiss is None:
            return None
        return self._faiss.IndexFlatIP(self.dimension)

    def _normalize_matrix(self, vectors: np.ndarray) -> np.ndarray:
        """Normalize vectors so FAISS inner product behaves like cosine similarity."""
        matrix = np.asarray(vectors, dtype="float32")
        if matrix.ndim == 1:
            matrix = matrix.reshape(1, -1)
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms

    def _load_from_disk(self) -> None:
        """Load a persisted FAISS index and its metadata if both files exist."""
        if not self.index_path.exists() or not self.metadata_path.exists():
            self.index = self._create_index()
            return

        if self._faiss is not None:
            self.index = self._faiss.read_index(str(self.index_path))
        else:
            self.index = None
        self.metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))

    def save(self) -> None:
        """Persist the FAISS index and metadata for later reuse."""
        if self._faiss is not None and self.index is not None:
            self._faiss.write_index(self.index, str(self.index_path))
        self.metadata_path.write_text(json.dumps(self.metadata, indent=2), encoding="utf-8")

    def store_vectors(self, vectors: np.ndarray, metadata: list[dict]) -> None:
        """Replace the current vector store with a normalized matrix and aligned metadata."""
        if len(vectors) != len(metadata):
            raise ValueError("Vectors and metadata must have the same length")

        self.metadata = metadata
        matrix = self._normalize_matrix(vectors)

        if self._faiss is not None:
            self.index = self._create_index()
            if len(matrix):
                self.index.add(matrix)
        else:
            self.index = matrix

        self.save()

    def add_vectors(self, vectors: np.ndarray, metadata: list[dict]) -> None:
        """Append new vectors and records to the existing vector store."""
        if len(vectors) != len(metadata):
            raise ValueError("Vectors and metadata must have the same length")

        matrix = self._normalize_matrix(vectors)
        if self._faiss is not None:
            if self.index is None:
                self.index = self._create_index()
            if len(matrix):
                self.index.add(matrix)
        else:
            current = self.index if isinstance(self.index, np.ndarray) else np.empty((0, self.dimension), dtype="float32")
            self.index = np.vstack([current, matrix]) if len(current) else matrix

        self.metadata.extend(metadata)
        self.save()

    def search(self, query_vector: np.ndarray, vectors: list[np.ndarray], top_k: int = 5) -> list[tuple[int, float]]:
        """Run cosine similarity search against an in-memory vector list."""
        if not vectors:
            return []

        matrix = self._normalize_matrix(np.asarray(vectors, dtype="float32"))
        query = self._normalize_matrix(np.asarray(query_vector, dtype="float32"))[0].reshape(1, -1)

        if self._faiss is not None:
            index = self._create_index()
            index.add(matrix)
            scores, indices = index.search(query, min(top_k, len(vectors)))
            return [(int(idx), float(score)) for idx, score in zip(indices[0], scores[0]) if idx >= 0]

        scores = matrix @ query.T
        ranked = np.argsort(scores[:, 0])[::-1][:top_k]
        return [(int(index), float(scores[index, 0])) for index in ranked]

    def search_index(self, query_vector: np.ndarray, top_k: int = 5) -> list[tuple[int, float]]:
        """Search the persisted vector store and return matching indices plus cosine scores."""
        if not self.metadata:
            return []

        query = self._normalize_matrix(np.asarray(query_vector, dtype="float32"))[0].reshape(1, -1)

        if self._faiss is not None and self.index is not None:
            scores, indices = self.index.search(query, min(top_k, len(self.metadata)))
            return [(int(idx), float(score)) for idx, score in zip(indices[0], scores[0]) if idx >= 0]

        if isinstance(self.index, np.ndarray) and len(self.index):
            scores = self.index @ query.T
            ranked = np.argsort(scores[:, 0])[::-1][:top_k]
            return [(int(index), float(scores[index, 0])) for index in ranked]
        return []

    def retrieve_top_similar_ideas(self, query_vector: np.ndarray, top_k: int = 5) -> list[dict]:
        """Return metadata-enriched top matches from the stored vector index."""
        matches = self.search_index(query_vector, top_k=top_k)
        results: list[dict] = []
        for idx, score in matches:
            item = dict(self.metadata[idx])
            item["similarity_score"] = round(score * 100, 2)
            results.append(item)
        return results
