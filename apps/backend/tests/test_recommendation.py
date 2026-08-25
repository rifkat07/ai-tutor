import pytest
from app.domain.cognitive.recommendation_engine import recommendation_engine


def test_grade_5_never_recommends_grade_11_parameters():
    """Пятикласснику КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО рекомендовать параметры 11 класса."""
    result = recommendation_engine.get_next_best_action(
        subject="math", current_mastery=0.25, grade=5
    )
    rec = result["primary_recommendation"]
    assert rec is not None
    assert rec["grade"] <= 5
    assert "параметр" not in rec["title"].lower()
    assert "окружност" not in rec["title"].lower()


def test_grade_11_recommends_high_value_ege_topics():
    """Для 11 класса выбираются высокобалльные темы ЕГЭ (№13, №18)."""
    result = recommendation_engine.get_next_best_action(
        subject="math", current_mastery=0.20, grade=11
    )
    rec = result["primary_recommendation"]
    assert rec is not None
    assert rec["potential_score_gain"] >= 2
