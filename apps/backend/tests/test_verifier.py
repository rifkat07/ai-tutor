import pytest

from app.domain.sympy_engine.verifier import math_verifier


# ====================================================================
# ARITHMETIC — POSITIVE
# ====================================================================


@pytest.mark.parametrize(
    "task,answer",
    [
        ("2 + 2", "4"),
        ("10 - 3 * 2", "4"),
        ("100 / 4", "25"),
        ("100 : 4", "25"),
        ("2^10", "1024"),
        ("(2 + 3) * 4", "20"),
        (r"\sqrt{25}", "5"),
        (r"\frac{3}{2}", "1.5"),
        (r"\frac{3}{2}", "1,5"),
        (r"\sqrt{2}", r"\sqrt{2}"),
        ("pi / 2", "pi/2"),
    ],
)
def test_arithmetic_positive(task, answer):
    """
    Проверка правильных арифметических ответов.
    """

    assert (
        math_verifier.verify_final_answer(
            task,
            answer,
        )
        is True
    )


# ====================================================================
# ARITHMETIC — NEGATIVE
# ====================================================================


@pytest.mark.parametrize(
    "task,answer",
    [
        ("2 + 2", "5"),
        ("10 - 3 * 2", "10"),
        ("100 / 4", "20"),
        ("2^10", "1000"),
        (r"\sqrt{25}", "25"),
        (r"\frac{3}{2}", "3"),
    ],
)
def test_arithmetic_negative(task, answer):
    """
    Проверка отклонения неправильных арифметических ответов.
    """

    assert (
        math_verifier.verify_final_answer(
            task,
            answer,
        )
        is False
    )


# ====================================================================
# VILENKIN / SCHOOL ARITHMETIC
# ====================================================================


def test_vilenkin_arithmetic_exact_solution():
    """
    Проверка школьной записи с делением через ":".

    124 * 15 + 3600 : 18 - 450
    =
    1610
    """

    task = (
        "124 * 15 + "
        "3600 : 18 - 450"
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "1610",
        )
        is True
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "1610.0",
        )
        is True
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "100",
        )
        is False
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "2060",
        )
        is False
    )


# ====================================================================
# LINEAR EQUATIONS — POSITIVE
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        ("4*x + 3*x = 77", "11"),
        ("2x = 10", "5"),
        ("3y + 6 = 0", "-2"),
        ("5q - 15 = 0", "3"),
        ("0x + x = 7", "7"),
        ("x / 2 = 5", "10"),
    ],
)
def test_linear_equations_positive(
    equation,
    answer,
):
    """
    Проверка правильных корней линейных уравнений.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is True
    )


# ====================================================================
# LINEAR EQUATIONS — NEGATIVE
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        ("4*x + 3*x = 77", "7"),
        ("2x = 10", "10"),
        ("3y + 6 = 0", "2"),
        ("5q - 15 = 0", "-3"),
    ],
)
def test_linear_equations_negative(
    equation,
    answer,
):
    """
    Проверка отклонения неправильных корней.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# ====================================================================
# QUADRATIC EQUATIONS — POSITIVE
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        ("x^2 - 49 = 0", "7"),
        ("x^2 - 49 = 0", "-7"),
        ("x^2 + 0x - 49 = 0", "7"),
        ("x^2 + 0x - 49 = 0", "-7"),
        ("x^2 - 2x + 1 = 0", "1"),
    ],
)
def test_quadratic_positive(
    equation,
    answer,
):
    """
    Проверка правильных корней квадратных уравнений.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is True
    )


# ====================================================================
# QUADRATIC EQUATIONS — NEGATIVE
# ====================================================================


def test_quadratic_wrong_root():
    """
    Заведомо неправильный корень должен быть отклонён.
    """

    result = (
        math_verifier.verify_equation_solution(
            "x^2 - 49 = 0",
            "5",
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# ====================================================================
# TRIGONOMETRY — EQUIVALENT
# ====================================================================


@pytest.mark.parametrize(
    "left,right",
    [
        (
            r"\sin(x)^2 + \cos(x)^2",
            "1",
        ),
        (
            r"2\sin(x)^2 + 3\sin(x)",
            r"\sin(x)(2\sin(x) + 3)",
        ),
        (
            r"3\cos(x)^2 - 2\cos(x)",
            r"\cos(x)(3\cos(x) - 2)",
        ),
        (
            r"\sin\left(x\right)",
            "sin(x)",
        ),
    ],
)
def test_trig_equivalent(
    left,
    right,
):
    """
    Проверка эквивалентных тригонометрических выражений.
    """

    assert (
        math_verifier.are_expressions_equivalent(
            left,
            right,
        )
        is True
    )


# ====================================================================
# TRIGONOMETRY — NOT EQUIVALENT
# ====================================================================


@pytest.mark.parametrize(
    "left,right",
    [
        (
            "sin(x)",
            "cos(x)",
        ),
        (
            "sin(x)^2",
            "sin(x)",
        ),
        (
            "sin(x)^2 + cos(x)^2",
            "2",
        ),
    ],
)
def test_trig_not_equivalent(
    left,
    right,
):
    """
    Проверка неэквивалентных тригонометрических выражений.
    """

    assert (
        math_verifier.are_expressions_equivalent(
            left,
            right,
        )
        is False
    )


# ====================================================================
# ALGEBRAIC EQUIVALENCE — POSITIVE
# ====================================================================


@pytest.mark.parametrize(
    "left,right",
    [
        (
            "(x + 1)^2",
            "x^2 + 2x + 1",
        ),
        (
            "(x - 1)(x + 2)",
            "x^2 + x - 2",
        ),
        (
            "2(x + 3)",
            "2x + 6",
        ),
        (
            "a(b + c)",
            "a*b + a*c",
        ),
        (
            "(q^2 - 1)/(q - 1)",
            "q + 1",
        ),
    ],
)
def test_algebraic_equivalence(
    left,
    right,
):
    """
    Проверка алгебраически эквивалентных выражений.
    """

    assert (
        math_verifier.are_expressions_equivalent(
            left,
            right,
        )
        is True
    )


# ====================================================================
# ALGEBRAIC EQUIVALENCE — NEGATIVE
# ====================================================================


@pytest.mark.parametrize(
    "left,right",
    [
        (
            "(x + 1)^2",
            "x^2 + 1",
        ),
        (
            "2(x + 3)",
            "2x + 3",
        ),
        (
            "a + b",
            "a - b",
        ),
    ],
)
def test_algebraic_non_equivalence(
    left,
    right,
):
    """
    Проверка алгебраически различных выражений.
    """

    assert (
        math_verifier.are_expressions_equivalent(
            left,
            right,
        )
        is False
    )


# ====================================================================
# LOGARITHMS — POSITIVE
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        (
            r"\log_{2}(x + 1) = 3",
            "7",
        ),
        (
            r"\log_{10}(x) = 2",
            "100",
        ),
        (
            r"\log_{3}(x + 2) = 2",
            "7",
        ),
    ],
)
def test_log_equation_positive(
    equation,
    answer,
):
    """
    Проверка правильных решений логарифмических уравнений.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is True
    )


# ====================================================================
# LOGARITHMS — NEGATIVE
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        (
            r"\log_{2}(x + 1) = 3",
            "8",
        ),
        (
            r"\log_{10}(x) = 2",
            "10",
        ),
    ],
)
def test_log_equation_negative(
    equation,
    answer,
):
    """
    Проверка неправильных решений логарифмических уравнений.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# ====================================================================
# VECTOR — 2D
# ====================================================================


def test_vector_distance_solution():
    """
    a = (17, 0)
    b = (1, -1)

    a - 12b
    =
    (5, 12)

    |a - 12b|
    =
    13
    """

    task = (
        "Даны векторы "
        "a = (17; 0), "
        "b = (1; -1). "
        "Длина a - 12b"
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "13",
        )
        is True
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "13.0",
        )
        is True
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "25",
        )
        is False
    )


# ====================================================================
# VECTOR — 3D EXACT
# ====================================================================


def test_vector_3d():
    """
    Проверка трёхмерного вектора.

    a = (1, 2, 3)
    b = (1, 1, 1)

    a - b
    =
    (0, 1, 2)

    |a - b|
    =
    sqrt(0^2 + 1^2 + 2^2)
    =
    sqrt(5)

    Точный ответ должен приниматься как в SymPy,
    так и в LaTeX-формате.
    """

    task = (
        "Даны векторы "
        "a = (1; 2; 3), "
        "b = (1; 1; 1). "
        "Длина a - b"
    )

    # ------------------------------------------------------------
    # SymPy notation
    # ------------------------------------------------------------

    assert (
        math_verifier.verify_final_answer(
            task,
            "sqrt(5)",
        )
        is True
    )

    # ------------------------------------------------------------
    # LaTeX notation
    # ------------------------------------------------------------

    assert (
        math_verifier.verify_final_answer(
            task,
            r"\sqrt{5}",
        )
        is True
    )

    # ------------------------------------------------------------
    # Очень точное десятичное представление
    # ------------------------------------------------------------

    assert (
        math_verifier.verify_final_answer(
            task,
            "2.23606797749979",
        )
        is True
    )


# ====================================================================
# VECTOR — 3D NEGATIVE
# ====================================================================


def test_vector_3d_wrong():
    """
    Для sqrt(5) ответ 5 неправильный.
    """

    task = (
        "Даны векторы "
        "a = (1; 2; 3), "
        "b = (1; 1; 1). "
        "Норма вектора a - b"
    )

    assert (
        math_verifier.verify_final_answer(
            task,
            "5",
        )
        is False
    )


# ====================================================================
# STUDENT ANSWER FORMATS
# ====================================================================


@pytest.mark.parametrize(
    "answer",
    [
        "11",
        "11.0",
        "11,0",
        "x = 11",
    ],
)
def test_student_answer_formats(
    answer,
):
    """
    Разные записи одного правильного числового ответа.
    """

    assert (
        math_verifier.verify_final_answer(
            "4x + 3x = 77",
            answer,
        )
        is True
    )


# ====================================================================
# SYMBOLIC STUDENT ANSWERS
# ====================================================================


@pytest.mark.parametrize(
    "task,answer",
    [
        (
            r"\sqrt{2}",
            "sqrt(2)",
        ),
        (
            r"\sqrt{2}",
            r"\sqrt{2}",
        ),
        (
            "pi / 4",
            "pi/4",
        ),
        (
            "2*pi",
            r"2\pi",
        ),
        (
            "1 / 3",
            "1/3",
        ),
    ],
)
def test_symbolic_student_answers(
    task,
    answer,
):
    """
    Точные символьные ответы предпочтительнее
    преждевременного округления.
    """

    assert (
        math_verifier.verify_final_answer(
            task,
            answer,
        )
        is True
    )


# ====================================================================
# DECIMAL PRECISION
# ====================================================================


def test_insufficient_decimal_precision_is_not_exact():
    """
    При строгом FINAL_ANSWER_TOLERANCE = 1e-8
    число 2.236 недостаточно точно представляет sqrt(5).

    Это НЕ ошибка verifier.

    Если приложение хочет принимать ответы,
    округлённые до тысячных, это должно задаваться
    политикой конкретной задачи, а не глобальным
    ослаблением математического сравнения.
    """

    assert (
        math_verifier.verify_final_answer(
            r"\sqrt{5}",
            "2.236",
        )
        is False
    )


def test_sufficient_decimal_precision():
    """
    Достаточно точное приближение sqrt(5)
    должно пройти текущий строгий tolerance.
    """

    assert (
        math_verifier.verify_final_answer(
            r"\sqrt{5}",
            "2.23606797749979",
        )
        is True
    )


# ====================================================================
# INVALID STUDENT ANSWERS
# ====================================================================


@pytest.mark.parametrize(
    "answer",
    [
        "",
        "abc",
        "не знаю",
        "ответ неизвестен",
    ],
)
def test_invalid_student_answers(
    answer,
):
    """
    Невалидный пользовательский ввод должен
    отклоняться без exception.
    """

    assert (
        math_verifier.verify_final_answer(
            "2 + 2",
            answer,
        )
        is False
    )


# ====================================================================
# MULTIVARIABLE EQUATION
# ====================================================================


def test_multivariable_equation_not_guessed():
    """
    Одного числа недостаточно для проверки:

        x + y = 10

    Verifier не должен сам угадывать значение y.
    """

    result = (
        math_verifier.verify_equation_solution(
            "x + y = 10",
            "5",
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# ====================================================================
# DYNAMIC VARIABLE NAMES
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        ("q + 2 = 10", "8"),
        ("v * 3 = 21", "7"),
        ("m - 5 = 4", "9"),
        ("r^2 = 16", "4"),
        ("r^2 = 16", "-4"),
    ],
)
def test_dynamic_variable_names(
    equation,
    answer,
):
    """
    Verifier не должен быть захардкожен только под x.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is True
    )


# ====================================================================
# ZERO COEFFICIENT
# ====================================================================


@pytest.mark.parametrize(
    "equation,answer",
    [
        ("x^2 + 0x - 49 = 0", "7"),
        ("x^2 + 0x - 49 = 0", "-7"),
        ("0x + x = 10", "10"),
    ],
)
def test_zero_coefficient(
    equation,
    answer,
):
    """
    Проверяет регрессию Python/SymPy:

        0x

    не должно интерпретироваться как начало hex literal.
    """

    result = (
        math_verifier.verify_equation_solution(
            equation,
            answer,
        )
    )

    assert (
        result["is_correct"]
        is True
    )


# ====================================================================
# IMPLICIT MULTIPLICATION
# ====================================================================


@pytest.mark.parametrize(
    "left,right",
    [
        (
            "2x",
            "2*x",
        ),
        (
            "2(x + 1)",
            "2*x + 2",
        ),
        (
            "x(x + 1)",
            "x^2 + x",
        ),
        (
            r"2\sin(x)",
            "2*sin(x)",
        ),
        (
            r"\sin(x)(x + 1)",
            "sin(x)*(x + 1)",
        ),
    ],
)
def test_implicit_multiplication(
    left,
    right,
):
    """
    Проверка неявного умножения.

    Особенно важен случай sin(x):
    parser не должен превращать его в sin*(x).
    """

    assert (
        math_verifier.are_expressions_equivalent(
            left,
            right,
        )
        is True
    )


# ====================================================================
# MALFORMED EXPRESSIONS
# ====================================================================


@pytest.mark.parametrize(
    "expression",
    [
        "",
        "(",
        ")",
        "2 +",
        "*/2",
    ],
)
def test_malformed_expressions_rejected(
    expression,
):
    """
    Повреждённые выражения не должны приводить
    к ложному положительному результату.
    """

    assert (
        math_verifier.are_expressions_equivalent(
            expression,
            "1",
        )
        is False
    )


# ====================================================================
# SECURITY
# ====================================================================


@pytest.mark.parametrize(
    "expression",
    [
        "__import__('os')",
        "eval('2+2')",
        "exec('x=1')",
        "open('test.txt')",
        "lambda x:x",
        "globals()",
        "locals()",
    ],
)
def test_unsafe_expression_rejected(
    expression,
):
    """
    Пользовательская строка не должна использоваться
    как произвольный Python-код.
    """

    assert (
        math_verifier.are_expressions_equivalent(
            expression,
            "1",
        )
        is False
    )
