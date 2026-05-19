import hashlib

import numpy as np

from config import settings
from utils.logger import get_logger


logger = get_logger(__name__)


class EmbeddingModel:
    """Load `all-MiniLM-L6-v2` and expose normalized text embedding helpers."""

    _shared_model = None
    _shared_dimension = 384
    _load_attempted = False

    def __init__(self) -> None:
        self.dimension = self._shared_dimension
        self._model = self._shared_model
        if self.__class__._load_attempted:
            if self.__class__._shared_model is not None:
                self._model = self.__class__._shared_model
                self.dimension = self.__class__._shared_dimension
            return

        self.__class__._load_attempted = True
        try:
            from sentence_transformers import SentenceTransformer

            model = SentenceTransformer(settings.embedding_model_name)
            self.__class__._shared_model = model
            self.__class__._shared_dimension = model.get_sentence_embedding_dimension()
            self._model = model
            self.dimension = self._shared_dimension
            logger.info("Loaded transformer model %s", settings.embedding_model_name)
        except Exception as exc:  # pragma: no cover - fallback depends on runtime environment
            logger.warning("Using hash-based embedding fallback: %s", exc)

    def encode(self, text: str) -> np.ndarray:
        """Return a single normalized vector for cosine-similarity search."""
        if self._model is not None:
            vector = self._model.encode(text, normalize_embeddings=True)
            return np.asarray(vector, dtype="float32")

        # The fallback keeps the app runnable even before the model download completes.
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        raw = np.frombuffer(digest * (self.dimension // len(digest) + 1), dtype=np.uint8)[: self.dimension]
        vector = raw.astype("float32")
        norm = np.linalg.norm(vector) or 1.0
        return vector / norm

    def encode_batch(self, texts: list[str]) -> np.ndarray:
        """Embed many texts at once and return a normalized matrix."""
        if not texts:
            return np.empty((0, self.dimension), dtype="float32")

        if self._model is not None:
            vectors = self._model.encode(texts, normalize_embeddings=True)
            return np.asarray(vectors, dtype="float32")

        return np.asarray([self.encode(text) for text in texts], dtype="float32")
