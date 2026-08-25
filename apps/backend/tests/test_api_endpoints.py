from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)


def test_api_verify_answer_arithmetic_cascade():
    """Эндпоинт /verify-answer подтверждает точный ответ 1610 и отсекает 100."""
    res_correct = client.post(
        "/api/v1/competencies/verify-answer",
        json={
            "task_context": "124 * 15 + 3600 : 18 - 450",
            "student_answer": "1610",
        },
    )
    assert res_correct.status_code == 200
    assert res_correct.json()["is_correct"] is True

    res_wrong = client.post(
        "/api/v1/competencies/verify-answer",
        json={
            "task_context": "124 * 15 + 3600 : 18 - 450",
            "student_answer": "100",
        },
    )
    assert res_wrong.status_code == 200
    assert res_wrong.json()["is_correct"] is False


def test_api_verify_answer_advanced_inequality():
    """Эндпоинт /verify-answer через каскад Advanced проверяет интервалы [2; +oo)."""
    res = client.post(
        "/api/v1/competencies/verify-answer",
        json={"task_context": "x >= 2", "student_answer": "[2; +oo)"},
    )
    assert res.status_code == 200
    assert res.json()["is_correct"] is True


def test_api_analytics_endpoint_honest_cold_start():
    """Эндпоинт /analytics отдает честную аналитику без моков."""
    res = client.get(
        "/api/v1/competencies/analytics?subject=math&grade=5&mastery=0.0"
    )
    assert res.status_code == 200
    data = res.json()
    assert "is_started" in data
    assert "projected_score" in data
    assert "target_score" in data
    assert "p_mastery" in data
    assert data["is_started"] is False
    assert data["p_mastery"] == 0.0


def test_api_recommendations_endpoint_grade_filter():
    """Эндпоинт /recommendations отдает рекомендации строго под класс ученика."""
    res = client.get(
        "/api/v1/competencies/recommendations?subject=math&grade=5&mastery=0.25"
    )
    assert res.status_code == 200
    data = res.json()
    assert "primary_recommendation" in data
    rec = data["primary_recommendation"]
    assert rec["grade"] <= 5


def test_api_semantic_search_endpoint():
    """Эндпоинт /semantic-search возвращает ранжированные задачи."""
    res = client.post(
        "/api/v1/tasks/semantic-search",
        json={
            "query": "уравнение корни",
            "subject": "math",
            "exam_type": "EGE",
            "limit": 5,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_api_sdamgia_catalog_pagination():
    """Эндпоинт /sdamgia-catalog отдает структуру с пагинацией."""
    res = client.get(
        "/api/v1/tasks/sdamgia-catalog?subject=math&exam_type=EGE&page=1&limit=5"
    )
    assert res.status_code == 200
    data = res.json()
    assert "variants" in data
    assert "page" in data
    assert "limit" in data
