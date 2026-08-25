import pytest
from app.domain.cognitive.bkt import bkt_engine

def test_bkt_initialization():
    """Проверка базовой вероятности владения темой."""
    # В текущей реализации BKTEngine не хранит параметры как атрибуты
    # Они передаются в метод update_mastery.
    # Проверим, что движок существует и имеет правильный метод
    assert hasattr(bkt_engine, 'update_mastery')
    # Проверим логику: при p_mastery=0.15, p_transit=0.2, p_guess=0.1, p_slip=0.1
    # и правильном ответе вероятность должна вырасти
    p_after = bkt_engine.update_mastery(
        p_mastery=0.15,
        p_transit=0.2,
        p_guess=0.1,
        p_slip=0.1,
        is_correct=True
    )
    assert p_after > 0.15  # проверяем, что вероятность выросла

def test_bkt_correct_answer_increases_mastery():
    """При верном ответе вероятность владения темой обязана расти."""
    p_prev = 0.35
    p_next = bkt_engine.update_mastery(
        p_mastery=p_prev,
        p_transit=0.2,
        p_guess=0.1,
        p_slip=0.1,
        is_correct=True
    )
    assert p_next > p_prev
    assert 0.0 <= p_next <= 1.0

def test_bkt_incorrect_answer_decreases_mastery():
    """При ошибке вероятность владения темой снижается."""
    p_prev = 0.50
    p_next = bkt_engine.update_mastery(
        p_mastery=p_prev,
        p_transit=0.2,
        p_guess=0.1,
        p_slip=0.1,
        is_correct=False
    )
    # При ошибке вероятность может упасть, но не обязательно
    # так как p_transit может её поднять. Проверим, что она не вышла за пределы
    assert 0.0 <= p_next <= 1.0
    # И что она уменьшилась (при разумных параметрах)
    assert p_next < p_prev

def test_bkt_consecutive_success_streak():
    """Серия из 4 верных ответов должна приводить к полному освоению (> 85%)."""
    p = 0.20
    for _ in range(4):
        p = bkt_engine.update_mastery(
            p_mastery=p,
            p_transit=0.2,
            p_guess=0.1,
            p_slip=0.1,
            is_correct=True
        )
    # Проверяем, что после 4 успешных ответов вероятность высокая
    assert p >= 0.85
