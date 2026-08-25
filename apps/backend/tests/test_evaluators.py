import json
import pytest
from app.services.essay_evaluator import essay_evaluator_service
from app.services.fipi_evaluator import fipi_evaluator_service
from app.services.theory_service import dynamic_theory_service


def test_fipi_json_repair_handles_markdown_and_escapes():
    """Парсер ФИПИ корректно восстанавливает JSON из markdown-кавычек."""
    raw_response = """```json
    {
      "max_score": 2,
      "awarded_score": 1,
      "verdict_summary": "Решение верное, но нет отбора корней.",
      "criteria": [
        {"name": "К1: Алгебра", "awarded": 1, "max": 1, "comment": "Ок"}
      ],
      "expert_formatting_advice": "Подписывайте отрезок [\\pi, 2\\pi].",
      "ideal_step_hint": "Пункт б через окружность."
    }
    ```"""
    repaired = fipi_evaluator_service._repair_json(raw_response)
    data = json.loads(repaired)
    assert data["max_score"] == 2
    assert data["awarded_score"] == 1
    assert len(data["criteria"]) == 1


def test_essay_json_repair_and_word_counter():
    """Парсер сочинений извлекает структуру из 12 критериев К1..К12."""
    raw_essay_json = """{
      "max_score": 21,
      "awarded_score": 20,
      "word_count": 215,
      "verdict_summary": "Отличная работа.",
      "criteria_breakdown": [
        {"code": "К1", "name": "Проблема", "awarded": 1, "max": 1, "comment": "Сформулирована верно"}
      ],
      "highlighted_errors": [],
      "expert_advice": "Продолжайте в том же духе."
    }"""
    repaired = essay_evaluator_service._repair_json(raw_essay_json)
    data = json.loads(repaired)
    assert data["max_score"] == 21
    assert data["awarded_score"] == 20
    assert data["word_count"] == 215


def test_cheatsheet_fallback_does_not_contain_final_answers():
    """Резервный генератор конспекта А4 не должен содержать сливов числовых ответов."""
    fallback_data = dynamic_theory_service._extract_cheatsheet_from_raw_text(
        "Невалидный текст ответа", "124 * 15 + 3600 : 18 - 450"
    )
    assert "formulas" in fallback_data
    assert "steps" in fallback_data
    assert len(fallback_data["steps"]) >= 3

    # Проверяем, что в описании шагов нет готовых чисел ответа
    for step in fallback_data["steps"]:
        assert "1610" not in step["desc"]
        assert "Итог: 1610" not in step["desc"]
