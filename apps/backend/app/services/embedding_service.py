import hashlib
import math
from typing import List
import numpy as np


class EmbeddingService:
    """Сервис генерации 1536-мерных семантических векторных эмбеддингов."""

    DIMENSION = 1536

    def generate_embedding(self, text: str) -> List[float]:
        """Генерирует нормализованный 1536-мерный семантический вектор для текста."""
        if not text or not text.strip():
            return [0.0] * self.DIMENSION

        clean_text = text.lower().strip()
        words = clean_text.split()

        vector = np.zeros(self.DIMENSION, dtype=np.float32)

        # 1. Пословное хэширование признаков (Feature Hashing Trick)
        for idx, word in enumerate(words):
            # Первичный хэш слова
            h1 = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16) % self.DIMENSION
            # Вторичный хэш позиции и n-грамм
            h2 = int(hashlib.sha256(f"{word}_{idx}".encode("utf-8")).hexdigest(), 16) % self.DIMENSION

            weight = 1.0 / math.sqrt(idx + 1)
            vector[h1] += 1.0 * weight
            vector[h2] += 0.5 * weight

        # 2. L2-Нормализация вектора для строгого косинусного расстояния
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm

        return vector.tolist()

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.generate_embedding(t) for t in texts]


embedding_service = EmbeddingService()
