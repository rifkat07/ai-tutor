import pytest
from app.domain.cognitive.irt import irt_engine

def test_irt_probability_bounds():
    """Вероятность решения задачи всегда строго лежит в интервале (0, 1)."""
    # Метод называется probability, а не compute_probability
    prob = irt_engine.probability(theta=0.0, a=1.5, b=0.5)
    assert 0.0 < prob < 1.0

def test_irt_theta_growth_on_success():
    """При решении задачи уровень способности Theta растет."""
    theta_start = 0.0
    # Метод называется update_theta, а не estimate_ability
    # и принимает список ответов, где ключ 'correct' (0 или 1), а не 'is_correct'
    theta_after = irt_engine.update_theta(
        current_theta=theta_start,
        responses=[
            {"a": 1.5, "b": 0.5, "correct": 1}  # правильный ответ
        ]
    )
    assert theta_after > theta_start

def test_irt_hard_question_discrimination():
    """Ученик с высоким Theta решает сложную задачу с большей вероятностью, чем ученик с низким Theta."""
    prob_weak = irt_engine.probability(theta=-1.5, a=2.0, b=1.5)
    prob_strong = irt_engine.probability(theta=1.5, a=2.0, b=1.5)
    assert prob_strong > prob_weak
