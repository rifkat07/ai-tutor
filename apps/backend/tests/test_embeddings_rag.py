import numpy as np
import pytest
from app.services.embedding_service import embedding_service


def test_embedding_dimension_is_1536():
    """Эмбеддинг обязан иметь размерность ровно 1536 float-чисел."""
    text = "Задача на закон сохранения импульса и энергии"
    vec = embedding_service.generate_embedding(text)
    assert isinstance(vec, list)
    assert len(vec) == 1536


def test_embedding_is_l2_normalized():
    """Вектор обязан быть строго L2-нормализован (норма равна 1.0)."""
    text = "В треугольнике ABC угол C равен 90 градусов"
    vec = np.array(embedding_service.generate_embedding(text), dtype=np.float32)
    norm = np.linalg.norm(vec)
    assert np.isclose(norm, 1.0, atol=1e-5)


def test_empty_text_returns_zero_vector():
    """Пустая строка возвращает нулевой вектор без исключений."""
    vec = embedding_service.generate_embedding("")
    assert len(vec) == 1536
    assert all(v == 0.0 for v in vec)


def test_semantic_similarity_ranking():
    """Близкие по смыслу фразы должны иметь большее косинусное сходство."""
    query = "тело соскальзывает с наклонной плоскости"
    similar_doc = "брусок скользит по наклонной плоскости под действием силы тяжести"
    different_doc = "правило написания суффиксов причастий в русском языке"

    q_vec = np.array(embedding_service.generate_embedding(query))
    sim_vec = np.array(embedding_service.generate_embedding(similar_doc))
    diff_vec = np.array(embedding_service.generate_embedding(different_doc))

    score_similar = float(np.dot(q_vec, sim_vec))
    score_different = float(np.dot(q_vec, diff_vec))

    assert score_similar > score_different


def test_batch_embeddings_generation():
    """Пакетная генерация эмбеддингов работает консистентно."""
    texts = ["Задача 1", "Задача 2", "Задача 3"]
    vectors = embedding_service.generate_embeddings_batch(texts)
    assert len(vectors) == 3
    for v in vectors:
        assert len(v) == 1536