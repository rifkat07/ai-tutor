import pytest
from app.services.sdamgia_service import sdamgia_service


def test_clean_html_decomposes_screen_reader_speech():
    """Очистка HTML удаляет скрытые теги диктора MathJax_Speech и лишние блоки."""
    html_with_speech = (
        '<div>Условие задачи: '
        '<span class="MathJax_Speech">дробь числитель x знаменатель 5</span>'
        '<span class="sr-only">аудио-подсказка</span>'
        '<img class="tex" src="/formula/svg/123.svg" alt="formula">'
        '</div>'
    )
    cleaned = sdamgia_service._clean_html_content(
        html_with_speech, base_url="https://math-ege.sdamgia.ru"
    )
    assert "MathJax_Speech" not in cleaned
    assert "дробь числитель" not in cleaned
    assert "sr-only" not in cleaned
    assert "https://math-ege.sdamgia.ru/formula/svg/123.svg" in cleaned


def test_clean_html_inverts_svg_for_dark_theme():
    """Векторные формулы получают класс инверсии для темной темы."""
    raw_html = '<img class="tex" src="/formula/svg/abc.svg">'
    cleaned = sdamgia_service._clean_html_content(
        raw_html, base_url="https://phys-ege.sdamgia.ru"
    )
    assert "invert" in cleaned
    assert "https://phys-ege.sdamgia.ru/formula/svg/abc.svg" in cleaned


def test_clean_html_preserves_task_diagrams():
    """Относительные пути к чертежам /get_file?id= дополняются доменом."""
    raw_html = '<div>График процесса: <img src="/get_file?id=554433"></div>'
    cleaned = sdamgia_service._clean_html_content(
        raw_html, base_url="https://phys-ege.sdamgia.ru"
    )
    assert "https://phys-ege.sdamgia.ru/get_file?id=554433" in cleaned


def test_clean_html_converts_mathjax_scripts():
    """Теги скриптов TeX конвертируются в $math$."""
    raw_html = '<div>Решите: <script type="math/tex">x^2 + y^2 = 25</script></div>'
    cleaned = sdamgia_service._clean_html_content(
        raw_html, base_url="https://math-ege.sdamgia.ru"
    )
    assert "$x^2 + y^2 = 25$" in cleaned or "$ x^2 + y^2 = 25 $" in cleaned
