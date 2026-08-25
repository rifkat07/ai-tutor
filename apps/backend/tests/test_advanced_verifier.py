import pytest
import sympy as sp

from app.domain.sympy_engine.advanced_verifier import (
    advanced_math_verifier,
)


# =====================================================================
# EQUATION SYSTEMS
# =====================================================================


def test_equation_system_correct():

    result = (
        advanced_math_verifier
        .verify_equation_system(
            equations=[
                "x + y = 5",
                "x - y = 1",
            ],
            student_values={
                "x": "3",
                "y": "2",
            },
        )
    )

    assert (
        result["is_correct"]
        is True
    )


def test_equation_system_wrong():

    result = (
        advanced_math_verifier
        .verify_equation_system(
            equations=[
                "x + y = 5",
                "x - y = 1",
            ],
            student_values={
                "x": "4",
                "y": "1",
            },
        )
    )

    assert (
        result["is_correct"]
        is False
    )


def test_equation_system_missing_variable():

    result = (
        advanced_math_verifier
        .verify_equation_system(
            equations=[
                "x + y = 5",
                "x - y = 1",
            ],
            student_values={
                "x": "3",
            },
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# =====================================================================
# MULTIPLE ROOTS
# =====================================================================


@pytest.mark.parametrize(
    "answer",
    [
        "{-2; 2}",
        "{2; -2}",
        "x = -2; 2",
    ],
)
def test_multiple_roots_complete(
    answer,
):

    result = (
        advanced_math_verifier
        .verify_solution_set(
            "x^2 - 4 = 0",
            answer,
        )
    )

    assert (
        result["is_correct"]
        is True
    )


def test_multiple_roots_missing_root():

    result = (
        advanced_math_verifier
        .verify_solution_set(
            "x^2 - 4 = 0",
            "{2}",
        )
    )

    assert (
        result["is_correct"]
        is False
    )


def test_multiple_roots_extra_root():

    result = (
        advanced_math_verifier
        .verify_solution_set(
            "x^2 - 4 = 0",
            "{-2; 2; 5}",
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# =====================================================================
# INTERVAL
# =====================================================================


def test_interval_closed():

    expected = sp.Interval(
        1,
        5,
    )

    assert (
        advanced_math_verifier
        .verify_interval(
            expected,
            "[1; 5]",
        )
        is True
    )


def test_interval_open():

    expected = sp.Interval.open(
        1,
        5,
    )

    assert (
        advanced_math_verifier
        .verify_interval(
            expected,
            "(1; 5)",
        )
        is True
    )


def test_interval_mixed():

    expected = sp.Interval(
        1,
        5,
        left_open=False,
        right_open=True,
    )

    assert (
        advanced_math_verifier
        .verify_interval(
            expected,
            "[1; 5)",
        )
        is True
    )


def test_interval_infinity():

    expected = sp.Interval(
        2,
        sp.oo,
        left_open=False,
        right_open=True,
    )

    assert (
        advanced_math_verifier
        .verify_interval(
            expected,
            "[2; +∞)",
        )
        is True
    )


# =====================================================================
# INEQUALITY
# =====================================================================


def test_simple_inequality():

    result = (
        advanced_math_verifier
        .verify_inequality(
            "x > 2",
            "(2; +∞)",
        )
    )

    assert (
        result["is_correct"]
        is True
    )


def test_simple_inequality_wrong():

    result = (
        advanced_math_verifier
        .verify_inequality(
            "x > 2",
            "[2; +∞)",
        )
    )

    assert (
        result["is_correct"]
        is False
    )


def test_linear_inequality():

    result = (
        advanced_math_verifier
        .verify_inequality(
            "2x + 1 <= 5",
            "(-∞; 2]",
        )
    )

    assert (
        result["is_correct"]
        is True
    )


# =====================================================================
# DOMAIN / ОДЗ
# =====================================================================


def test_domain_sqrt():

    result = (
        advanced_math_verifier
        .verify_domain(
            "sqrt(x - 2)",
            "[2; +∞)",
        )
    )

    assert (
        result["is_correct"]
        is True
    )


def test_domain_log():

    result = (
        advanced_math_verifier
        .verify_domain(
            "log(x)",
            "(0; +∞)",
        )
    )

    assert (
        result["is_correct"]
        is True
    )


def test_domain_wrong():

    result = (
        advanced_math_verifier
        .verify_domain(
            "sqrt(x - 2)",
            "(2; +∞)",
        )
    )

    assert (
        result["is_correct"]
        is False
    )


# =====================================================================
# DERIVATIVES
# =====================================================================


@pytest.mark.parametrize(
    "expression,answer",
    [
        (
            "x^2",
            "2x",
        ),
        (
            "x^3 + 2x",
            "3x^2 + 2",
        ),
        (
            "sin(x)",
            "cos(x)",
        ),
        (
            "cos(x)",
            "-sin(x)",
        ),
        (
            "exp(x)",
            "exp(x)",
        ),
        (
            "log(x)",
            "1/x",
        ),
    ],
)
def test_derivative_correct(
    expression,
    answer,
):

    assert (
        advanced_math_verifier
        .verify_derivative(
            expression,
            answer,
        )
        is True
    )


def test_derivative_wrong():

    assert (
        advanced_math_verifier
        .verify_derivative(
            "x^2",
            "x",
        )
        is False
    )


# =====================================================================
# SECOND DERIVATIVE
# =====================================================================


def test_second_derivative():

    assert (
        advanced_math_verifier
        .verify_derivative(
            "x^3",
            "6x",
            order=2,
        )
        is True
    )


# =====================================================================
# INDEFINITE INTEGRALS
# =====================================================================


@pytest.mark.parametrize(
    "expression,answer",
    [
        (
            "2x",
            "x^2",
        ),
        (
            "cos(x)",
            "sin(x)",
        ),
        (
            "1/x",
            "log(x)",
        ),
        (
            "3x^2",
            "x^3 + 100",
        ),
    ],
)
def test_indefinite_integral_correct(
    expression,
    answer,
):

    assert (
        advanced_math_verifier
        .verify_indefinite_integral(
            expression,
            answer,
        )
        is True
    )


def test_indefinite_integral_wrong():

    assert (
        advanced_math_verifier
        .verify_indefinite_integral(
            "2x",
            "2x^2",
        )
        is False
    )


# =====================================================================
# DEFINITE INTEGRALS
# =====================================================================


def test_definite_integral():

    assert (
        advanced_math_verifier
        .verify_definite_integral(
            expression="x",
            lower="0",
            upper="2",
            student_answer="2",
        )
        is True
    )


def test_definite_integral_trig():

    assert (
        advanced_math_verifier
        .verify_definite_integral(
            expression="sin(x)",
            lower="0",
            upper="pi",
            student_answer="2",
        )
        is True
    )


def test_definite_integral_wrong():

    assert (
        advanced_math_verifier
        .verify_definite_integral(
            expression="x",
            lower="0",
            upper="2",
            student_answer="4",
        )
        is False
    )


# =====================================================================
# LIMITS
# =====================================================================


def test_limit_polynomial():

    assert (
        advanced_math_verifier
        .verify_limit(
            expression="x^2",
            point="2",
            student_answer="4",
        )
        is True
    )


def test_limit_sin_x_over_x():

    assert (
        advanced_math_verifier
        .verify_limit(
            expression="sin(x)/x",
            point="0",
            student_answer="1",
        )
        is True
    )


def test_limit_infinity():

    assert (
        advanced_math_verifier
        .verify_limit(
            expression="1/x",
            point="oo",
            student_answer="0",
            direction="-",
        )
        is True
    )


def test_limit_wrong():

    assert (
        advanced_math_verifier
        .verify_limit(
            expression="sin(x)/x",
            point="0",
            student_answer="0",
        )
        is False
    )


# =====================================================================
# GEOMETRY
# =====================================================================


def test_rectangle_area():

    assert (
        advanced_math_verifier
        .verify_geometry(
            "rectangle_area",
            {
                "a": 5,
                "b": 7,
            },
            "35",
        )
        is True
    )


def test_rectangle_perimeter():

    assert (
        advanced_math_verifier
        .verify_geometry(
            "rectangle_perimeter",
            {
                "a": 5,
                "b": 7,
            },
            "24",
        )
        is True
    )


def test_triangle_area():

    assert (
        advanced_math_verifier
        .verify_geometry(
            "triangle_area",
            {
                "base": 10,
                "height": 6,
            },
            "30",
        )
        is True
    )


def test_circle_area():

    assert (
        advanced_math_verifier
        .verify_geometry(
            "circle_area",
            {
                "r": 3,
            },
            "9*pi",
        )
        is True
    )


def test_pythagorean_triangle():

    assert (
        advanced_math_verifier
        .verify_geometry(
            "pythagorean_hypotenuse",
            {
                "a": 5,
                "b": 12,
            },
            "13",
        )
        is True
    )


def test_geometry_wrong():

    assert (
        advanced_math_verifier
        .verify_geometry(
            "rectangle_area",
            {
                "a": 5,
                "b": 7,
            },
            "24",
        )
        is False
    )


# =====================================================================
# UNITS
# =====================================================================


@pytest.mark.parametrize(
    "expected,student",
    [
        (
            "1 m",
            "100 cm",
        ),
        (
            "1 km",
            "1000 m",
        ),
        (
            "2.5 m",
            "250 cm",
        ),
        (
            "1 kg",
            "1000 g",
        ),
        (
            "1 h",
            "60 min",
        ),
        (
            "1 min",
            "60 s",
        ),
    ],
)
def test_unit_conversion(
    expected,
    student,
):

    assert (
        advanced_math_verifier
        .verify_quantity(
            expected,
            student,
        )
        is True
    )


def test_wrong_dimension():

    assert (
        advanced_math_verifier
        .verify_quantity(
            "1 m",
            "1 kg",
        )
        is False
    )


def test_wrong_quantity():

    assert (
        advanced_math_verifier
        .verify_quantity(
            "1 m",
            "10 cm",
        )
        is False
    )


# =====================================================================
# PERCENTAGES
# =====================================================================


def test_percentage_of():

    assert (
        advanced_math_verifier
        .verify_percentage(
            original=200,
            percent=15,
            operation="percent_of",
            student_answer="30",
        )
        is True
    )


def test_percentage_increase():

    assert (
        advanced_math_verifier
        .verify_percentage(
            original=1000,
            percent=20,
            operation="increase",
            student_answer="1200",
        )
        is True
    )


def test_percentage_decrease():

    assert (
        advanced_math_verifier
        .verify_percentage(
            original=1000,
            percent=20,
            operation="decrease",
            student_answer="800",
        )
        is True
    )


def test_percentage_wrong():

    assert (
        advanced_math_verifier
        .verify_percentage(
            original=200,
            percent=15,
            operation="percent_of",
            student_answer="15",
        )
        is False
    )


# =====================================================================
# STRUCTURED WORD PROBLEMS
# =====================================================================


def test_word_problem_distance():

    model = {
        "formula": "v*t",
        "values": {
            "v": 60,
            "t": 3,
        },
    }

    assert (
        advanced_math_verifier
        .verify_word_problem(
            model,
            "180",
        )
        is True
    )


def test_word_problem_price():

    model = {
        "formula": "price*count",
        "values": {
            "price": 25,
            "count": 4,
        },
    }

    assert (
        advanced_math_verifier
        .verify_word_problem(
            model,
            "100",
        )
        is True
    )


def test_word_problem_wrong():

    model = {
        "formula": "v*t",
        "values": {
            "v": 60,
            "t": 3,
        },
    }

    assert (
        advanced_math_verifier
        .verify_word_problem(
            model,
            "200",
        )
        is False
    )
