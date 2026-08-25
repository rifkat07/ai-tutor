import re
from dataclasses import dataclass
from typing import Any, Optional

import sympy as sp

from sympy import (
    Eq,
    FiniteSet,
    Interval,
    Matrix,
    S,
    Symbol,
    diff,
    integrate,
    limit,
    solveset,
)

from app.domain.sympy_engine.verifier import math_verifier


# =====================================================================
# RESULT
# =====================================================================


@dataclass
class VerificationResult:
    is_correct: bool
    message: str = ""
    expected: Any = None
    received: Any = None

    def to_dict(self) -> dict:
        return {
            "is_correct": self.is_correct,
            "message": self.message,
            "expected": self.expected,
            "received": self.received,
        }


# =====================================================================
# ADVANCED VERIFIER
# =====================================================================


class AdvancedMathVerifier:
    """
    Расширенный математический verifier.

    MathVerifier остаётся базовым ядром.

    Этот класс добавляет:
    - системы уравнений;
    - множества решений;
    - неравенства;
    - интервалы;
    - ОДЗ;
    - производные;
    - неопределённые интегралы;
    - определённые интегралы;
    - пределы;
    - геометрические формулы;
    - единицы измерения;
    - проценты;
    - структурированные текстовые задачи.
    """

    def __init__(self):
        self.base = math_verifier

    # =================================================================
    # COMMON
    # =================================================================

    def _parse(self, expression: str):
        """
        Использует уже протестированный parser MathVerifier.
        """

        if expression is None:
            return None

        clean = self.base._latex_to_sympy(
            expression
        )

        return self.base._parse_sympy(
            clean
        )

    # -----------------------------------------------------------------

    def _parse_equation(self, equation: str):
        """
        "2x + y = 5" -> Eq(2*x + y, 5)
        """

        if not equation:
            return None

        clean = self.base._latex_to_sympy(
            equation
        )

        if clean.count("=") != 1:
            return None

        lhs_text, rhs_text = clean.split(
            "=",
            1,
        )

        lhs = self.base._parse_sympy(
            lhs_text
        )

        rhs = self.base._parse_sympy(
            rhs_text
        )

        if lhs is None or rhs is None:
            return None

        return Eq(
            lhs,
            rhs,
        )

    # =================================================================
    # SET PARSER
    # =================================================================

    def _parse_solution_set(
        self,
        text: str,
    ):
        """
        Разбирает множество числовых решений.

        Поддерживает:

            {-2, 3}
            {-2; 3}
            x = -2, 3
            x = -2; 3
            -2, 3

        ВНИМАНИЕ:
        этот parser предназначен именно для множества решений,
        поэтому запятая здесь считается разделителем элементов,
        а не десятичным разделителем.
        """

        if text is None:
            return None

        value = str(text).strip()

        if not value:
            return None

        # x = ...
        if "=" in value:

            _, value = value.split(
                "=",
                1,
            )

        value = value.strip()

        if (
            value.startswith("{")
            and value.endswith("}")
        ):
            value = value[1:-1]

        parts = re.split(
            r"[;,]",
            value,
        )

        values = []

        for part in parts:

            part = part.strip()

            if not part:
                continue

            parsed = self._parse(
                part
            )

            if parsed is None:
                return None

            if parsed.free_symbols:
                return None

            values.append(
                parsed
            )

        if not values:
            return None

        return FiniteSet(
            *values
        )

    # =================================================================
    # EQUATION SYSTEM
    # =================================================================

    def verify_equation_system(
        self,
        equations: list[str],
        student_values: dict[str, str],
    ) -> dict:
        """
        Пример:

            equations = [
                "x + y = 5",
                "x - y = 1"
            ]

            student_values = {
                "x": "3",
                "y": "2"
            }
        """

        try:

            parsed_equations = []

            for equation in equations:

                parsed = self._parse_equation(
                    equation
                )

                if parsed is None:

                    return VerificationResult(
                        False,
                        "Не удалось разобрать систему",
                    ).to_dict()

                parsed_equations.append(
                    parsed
                )

            substitutions = {}

            for name, value in student_values.items():

                parsed_value = self._parse(
                    value
                )

                if parsed_value is None:
                    return VerificationResult(
                        False,
                        f"Не удалось разобрать {name}",
                    ).to_dict()

                substitutions[
                    Symbol(name)
                ] = parsed_value

            for equation in parsed_equations:

                difference = (
                    equation.lhs
                    - equation.rhs
                )

                substituted = difference.subs(
                    substitutions
                )

                if substituted.free_symbols:
                    return VerificationResult(
                        False,
                        "Указаны не все неизвестные",
                    ).to_dict()

                if sp.simplify(
                    substituted
                ) != 0:

                    return VerificationResult(
                        False,
                        "Решение не удовлетворяет системе",
                    ).to_dict()

            return VerificationResult(
                True,
                "Решение системы верное",
            ).to_dict()

        except Exception as exc:

            return VerificationResult(
                False,
                f"Ошибка: {type(exc).__name__}: {exc}",
            ).to_dict()

    # =================================================================
    # MULTIPLE ROOTS
    # =================================================================

    def verify_solution_set(
        self,
        equation: str,
        student_answer: str,
        variable: str = "x",
        domain=S.Reals,
    ) -> dict:
        """
        Проверяет ВСЁ множество решений.

        В отличие от verify_equation_solution(),
        проверяет не один корень, а полноту ответа.
        """

        try:

            eq = self._parse_equation(
                equation
            )

            if eq is None:
                return VerificationResult(
                    False,
                    "Не удалось разобрать уравнение",
                ).to_dict()

            symbol = Symbol(
                variable
            )

            expected = solveset(
                eq.lhs - eq.rhs,
                symbol,
                domain=domain,
            )

            received = self._parse_solution_set(
                student_answer
            )

            if received is None:
                return VerificationResult(
                    False,
                    "Не удалось разобрать множество решений",
                ).to_dict()

            correct = (
                expected == received
            )

            return VerificationResult(
                correct,
                (
                    "Множество решений верное"
                    if correct
                    else "Множество решений неверное или неполное"
                ),
                str(expected),
                str(received),
            ).to_dict()

        except Exception as exc:

            return VerificationResult(
                False,
                f"Ошибка: {type(exc).__name__}: {exc}",
            ).to_dict()

    # =================================================================
    # INTERVAL PARSER
    # =================================================================

    def parse_interval(
        self,
        text: str,
    ):
        """
        Поддерживает:

            (1; 5)
            [1; 5]
            (-oo; 3]
            [2; +oo)

        Также:
            ∞
            +∞
            -∞
        """

        if text is None:
            return None

        value = str(text).strip()

        value = value.replace(
            "∞",
            "oo",
        )

        value = value.replace(
            "+oo",
            "oo",
        )

        value = value.replace(
            r"\infty",
            "oo",
        )

        pattern = re.fullmatch(
            r"\s*"
            r"([\(\[])"
            r"\s*(.+?)\s*"
            r"[;,]"
            r"\s*(.+?)\s*"
            r"([\)\]])"
            r"\s*",
            value,
        )

        if not pattern:
            return None

        left_bracket = pattern.group(1)
        left_text = pattern.group(2)

        right_text = pattern.group(3)
        right_bracket = pattern.group(4)

        left = self._parse(
            left_text
        )

        right = self._parse(
            right_text
        )

        if left is None or right is None:
            return None

        return Interval(
            left,
            right,
            left_open=(
                left_bracket == "("
            ),
            right_open=(
                right_bracket == ")"
            ),
        )

    # =================================================================
    # INTERVAL
    # =================================================================

    def verify_interval(
        self,
        expected_interval,
        student_answer: str,
    ) -> bool:

        received = self.parse_interval(
            student_answer
        )

        if received is None:
            return False

        return (
            expected_interval
            == received
        )

    # =================================================================
    # INEQUALITY
    # =================================================================

    def verify_inequality(
        self,
        inequality: str,
        student_answer: str,
        variable: str = "x",
    ) -> dict:
        """
        Примеры:

            x > 2
            x <= 5
            x^2 < 9

        Ответ должен быть интервалом.
        """

        try:

            clean = self.base._latex_to_sympy(
                inequality
            )

            clean = clean.replace(
                r"\le",
                "<=",
            )

            clean = clean.replace(
                r"\ge",
                ">=",
            )

            clean = clean.replace(
                "≤",
                "<=",
            )

            clean = clean.replace(
                "≥",
                ">=",
            )

            operators = [
                "<=",
                ">=",
                "<",
                ">",
            ]

            operator = None

            for candidate in operators:

                if candidate in clean:
                    operator = candidate
                    break

            if operator is None:
                return VerificationResult(
                    False,
                    "Не найден знак неравенства",
                ).to_dict()

            lhs_text, rhs_text = clean.split(
                operator,
                1,
            )

            lhs = self.base._parse_sympy(
                lhs_text
            )

            rhs = self.base._parse_sympy(
                rhs_text
            )

            if lhs is None or rhs is None:
                return VerificationResult(
                    False,
                    "Не удалось разобрать неравенство",
                ).to_dict()

            relations = {
                "<": sp.Lt,
                "<=": sp.Le,
                ">": sp.Gt,
                ">=": sp.Ge,
            }

            relation = relations[
                operator
            ](
                lhs,
                rhs,
            )

            symbol = Symbol(
                variable
            )

            expected = sp.solve_univariate_inequality(
                relation,
                symbol,
                relational=False,
            )

            received = self.parse_interval(
                student_answer
            )

            if received is None:
                return VerificationResult(
                    False,
                    "Не удалось разобрать интервал",
                ).to_dict()

            correct = (
                expected == received
            )

            return VerificationResult(
                correct,
                (
                    "Решение неравенства верное"
                    if correct
                    else "Решение неравенства неверное"
                ),
                str(expected),
                str(received),
            ).to_dict()

        except Exception as exc:

            return VerificationResult(
                False,
                f"Ошибка: {type(exc).__name__}: {exc}",
            ).to_dict()

    # =================================================================
    # DOMAIN / ОДЗ
    # =================================================================

    def get_domain(
        self,
        expression: str,
        variable: str = "x",
    ):
        """
        Вычисляет область определения вещественного выражения.
        """

        expr = self._parse(
            expression
        )

        if expr is None:
            return None

        symbol = Symbol(
            variable
        )

        return sp.calculus.util.continuous_domain(
            expr,
            symbol,
            S.Reals,
        )

    # -----------------------------------------------------------------

    def verify_domain(
        self,
        expression: str,
        student_answer: str,
        variable: str = "x",
    ) -> dict:

        try:

            expected = self.get_domain(
                expression,
                variable,
            )

            if expected is None:
                return VerificationResult(
                    False,
                    "Не удалось определить ОДЗ",
                ).to_dict()

            received = self.parse_interval(
                student_answer
            )

            if received is None:

                return VerificationResult(
                    False,
                    "Не удалось разобрать ОДЗ",
                ).to_dict()

            correct = (
                expected == received
            )

            return VerificationResult(
                correct,
                (
                    "ОДЗ указана верно"
                    if correct
                    else "ОДЗ указана неверно"
                ),
                str(expected),
                str(received),
            ).to_dict()

        except Exception as exc:

            return VerificationResult(
                False,
                f"Ошибка: {type(exc).__name__}: {exc}",
            ).to_dict()

    # =================================================================
    # DERIVATIVE
    # =================================================================

    def verify_derivative(
        self,
        expression: str,
        student_answer: str,
        variable: str = "x",
        order: int = 1,
    ) -> bool:

        try:

            expr = self._parse(
                expression
            )

            student = self._parse(
                student_answer
            )

            if expr is None or student is None:
                return False

            symbol = Symbol(
                variable
            )

            expected = diff(
                expr,
                symbol,
                order,
            )

            return self.base._symbolically_equal(
                expected,
                student,
            )

        except Exception:

            return False

    # =================================================================
    # INDEFINITE INTEGRAL
    # =================================================================

    def verify_indefinite_integral(
        self,
        expression: str,
        student_answer: str,
        variable: str = "x",
    ) -> bool:
        """
        Для неопределённого интеграла корректнее не сравнивать
        первообразные напрямую.

        Проверяем:

            derivative(student_answer) == integrand

        Поэтому +C не требуется для машинной проверки.
        """

        try:

            integrand = self._parse(
                expression
            )

            student = self._parse(
                student_answer
            )

            if (
                integrand is None
                or student is None
            ):
                return False

            symbol = Symbol(
                variable
            )

            derivative = diff(
                student,
                symbol,
            )

            return self.base._symbolically_equal(
                derivative,
                integrand,
            )

        except Exception:

            return False

    # =================================================================
    # DEFINITE INTEGRAL
    # =================================================================

    def verify_definite_integral(
        self,
        expression: str,
        lower: str,
        upper: str,
        student_answer: str,
        variable: str = "x",
    ) -> bool:

        try:

            expr = self._parse(
                expression
            )

            a = self._parse(
                lower
            )

            b = self._parse(
                upper
            )

            student = self._parse(
                student_answer
            )

            if any(
                value is None
                for value in (
                    expr,
                    a,
                    b,
                    student,
                )
            ):
                return False

            symbol = Symbol(
                variable
            )

            expected = integrate(
                expr,
                (
                    symbol,
                    a,
                    b,
                ),
            )

            return self.base._symbolically_equal(
                expected,
                student,
            )

        except Exception:

            return False

    # =================================================================
    # LIMIT
    # =================================================================

    def verify_limit(
        self,
        expression: str,
        point: str,
        student_answer: str,
        variable: str = "x",
        direction: str = "+-",
    ) -> bool:

        try:

            expr = self._parse(
                expression
            )

            point_expr = self._parse(
                point
            )

            student = self._parse(
                student_answer
            )

            if any(
                value is None
                for value in (
                    expr,
                    point_expr,
                    student,
                )
            ):
                return False

            symbol = Symbol(
                variable
            )

            expected = limit(
                expr,
                symbol,
                point_expr,
                dir=direction,
            )

            return self.base._symbolically_equal(
                expected,
                student,
            )

        except Exception:

            return False

    # =================================================================
    # GEOMETRY
    # =================================================================

    def verify_geometry(
        self,
        problem_type: str,
        parameters: dict,
        student_answer: str,
    ) -> bool:
        """
        Геометрия должна поступать в структурированном виде.

        Это сознательно НЕ NLP parser.

        Примеры:

            problem_type="rectangle_area"
            parameters={"a": 5, "b": 7}

            problem_type="circle_area"
            parameters={"r": 3}
        """

        try:

            student = self._parse(
                student_answer
            )

            if student is None:
                return False

            expected = None

            if problem_type == "rectangle_area":

                a = sp.sympify(
                    parameters["a"]
                )

                b = sp.sympify(
                    parameters["b"]
                )

                expected = a * b

            elif problem_type == "rectangle_perimeter":

                a = sp.sympify(
                    parameters["a"]
                )

                b = sp.sympify(
                    parameters["b"]
                )

                expected = 2 * (
                    a + b
                )

            elif problem_type == "triangle_area":

                base = sp.sympify(
                    parameters["base"]
                )

                height = sp.sympify(
                    parameters["height"]
                )

                expected = (
                    base
                    * height
                    / 2
                )

            elif problem_type == "circle_area":

                radius = sp.sympify(
                    parameters["r"]
                )

                expected = (
                    sp.pi
                    * radius ** 2
                )

            elif problem_type == "circle_length":

                radius = sp.sympify(
                    parameters["r"]
                )

                expected = (
                    2
                    * sp.pi
                    * radius
                )

            elif problem_type == "pythagorean_hypotenuse":

                a = sp.sympify(
                    parameters["a"]
                )

                b = sp.sympify(
                    parameters["b"]
                )

                expected = sp.sqrt(
                    a ** 2
                    + b ** 2
                )

            elif problem_type == "distance_2d":

                x1 = sp.sympify(
                    parameters["x1"]
                )

                y1 = sp.sympify(
                    parameters["y1"]
                )

                x2 = sp.sympify(
                    parameters["x2"]
                )

                y2 = sp.sympify(
                    parameters["y2"]
                )

                expected = sp.sqrt(
                    (x2 - x1) ** 2
                    + (y2 - y1) ** 2
                )

            else:

                return False

            return self.base._symbolically_equal(
                expected,
                student,
            )

        except Exception:

            return False

    # =================================================================
    # UNITS
    # =================================================================

    _UNIT_ALIASES = {
        # Length
        "мм": ("length", 0.001),
        "mm": ("length", 0.001),

        "см": ("length", 0.01),
        "cm": ("length", 0.01),

        "м": ("length", 1.0),
        "m": ("length", 1.0),

        "км": ("length", 1000.0),
        "km": ("length", 1000.0),

        # Mass
        "г": ("mass", 0.001),
        "g": ("mass", 0.001),

        "кг": ("mass", 1.0),
        "kg": ("mass", 1.0),

        # Time
        "с": ("time", 1.0),
        "сек": ("time", 1.0),
        "s": ("time", 1.0),

        "мин": ("time", 60.0),
        "min": ("time", 60.0),

        "ч": ("time", 3600.0),
        "h": ("time", 3600.0),
    }

    def _parse_quantity(
        self,
        text: str,
    ):
        """
        Пример:

            250 cm
            2.5 м
            3 кг
        """

        if text is None:
            return None

        value = str(text).strip()

        value = re.sub(
            r"(?<=\d),(?=\d)",
            ".",
            value,
        )

        match = re.fullmatch(
            r"\s*"
            r"([-+]?(?:\d+(?:\.\d+)?|\.\d+))"
            r"\s*"
            r"([A-Za-zА-Яа-я]+)"
            r"\s*",
            value,
        )

        if not match:
            return None

        numeric = float(
            match.group(1)
        )

        unit = match.group(2).lower()

        info = self._UNIT_ALIASES.get(
            unit
        )

        if info is None:
            return None

        dimension, factor = info

        return {
            "dimension": dimension,
            "base_value": (
                numeric * factor
            ),
            "unit": unit,
        }

    # -----------------------------------------------------------------

    def verify_quantity(
        self,
        expected: str,
        student_answer: str,
        tolerance: float = 1e-9,
    ) -> bool:

        expected_q = self._parse_quantity(
            expected
        )

        student_q = self._parse_quantity(
            student_answer
        )

        if (
            expected_q is None
            or student_q is None
        ):
            return False

        if (
            expected_q["dimension"]
            != student_q["dimension"]
        ):
            return False

        return (
            abs(
                expected_q["base_value"]
                - student_q["base_value"]
            )
            <= tolerance
        )

    # =================================================================
    # PERCENTAGE
    # =================================================================

    def verify_percentage(
        self,
        original,
        percent,
        operation: str,
        student_answer: str,
    ) -> bool:
        """
        operation:

            "percent_of"
            "increase"
            "decrease"
        """

        try:

            original = sp.sympify(
                original
            )

            percent = sp.sympify(
                percent
            )

            student = self._parse(
                student_answer
            )

            if student is None:
                return False

            ratio = percent / 100

            if operation == "percent_of":

                expected = (
                    original
                    * ratio
                )

            elif operation == "increase":

                expected = (
                    original
                    * (1 + ratio)
                )

            elif operation == "decrease":

                expected = (
                    original
                    * (1 - ratio)
                )

            else:

                return False

            return self.base._symbolically_equal(
                expected,
                student,
            )

        except Exception:

            return False

    # =================================================================
    # STRUCTURED WORD PROBLEM
    # =================================================================

    def verify_word_problem(
        self,
        model: dict,
        student_answer: str,
    ) -> bool:
        """
        Проверка УЖЕ формализованной текстовой задачи.

        Например NLP/LLM слой преобразовал:

            "Автомобиль ехал 3 часа со скоростью 60 км/ч.
             Какой путь?"

        в:

            {
                "formula": "v*t",
                "values": {
                    "v": 60,
                    "t": 3
                }
            }

        Math verifier не должен самостоятельно угадывать
        математическую модель из произвольного русского текста.
        """

        try:

            formula = model.get(
                "formula"
            )

            values = model.get(
                "values",
                {},
            )

            if not formula:
                return False

            expression = self._parse(
                formula
            )

            student = self._parse(
                student_answer
            )

            if (
                expression is None
                or student is None
            ):
                return False

            substitutions = {}

            for name, value in values.items():

                substitutions[
                    Symbol(name)
                ] = sp.sympify(
                    value
                )

            expected = expression.subs(
                substitutions
            )

            if expected.free_symbols:
                return False

            return self.base._symbolically_equal(
                expected,
                student,
            )

        except Exception:

            return False


# =====================================================================
# GLOBAL INSTANCE
# =====================================================================


advanced_math_verifier = AdvancedMathVerifier()
