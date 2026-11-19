import os

# Ensure PyTorch is preferred over TensorFlow to prevent Keras 3 compatibility conflicts
os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("USE_TORCH", "1")

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
            logger.info("Successfully loaded transformer model %s (dim=%d)", settings.embedding_model_name, self.dimension)
        except Exception as exc:
            logger.error("Failed to load transformer model %s: %s", settings.embedding_model_name, exc, exc_info=True)
            self._model = None
            raise RuntimeError(
                f"Embedding model '{settings.embedding_model_name}' could not be loaded: {exc}"
            ) from exc

    def encode(self, text: str) -> np.ndarray:
        """Return a single normalized vector for cosine-similarity search."""
        if self._model is None:
            raise RuntimeError("Embedding model is not initialized.")
        vector = self._model.encode(text, normalize_embeddings=True)
        return np.asarray(vector, dtype="float32")

    def encode_batch(self, texts: list[str]) -> np.ndarray:
        """Embed many texts at once and return a normalized matrix."""
        if not texts:
            return np.empty((0, self.dimension), dtype="float32")

        if self._model is None:
            raise RuntimeError("Embedding model is not initialized.")
        vectors = self._model.encode(texts, normalize_embeddings=True)
        return np.asarray(vectors, dtype="float32")
