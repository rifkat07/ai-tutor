import math
import re
from typing import Optional

import sympy as sp

from sympy.parsing.sympy_parser import (
    convert_xor,
    function_exponentiation,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)


class MathVerifier:
    """
    Универсальное математическое ядро проверки SymPy CAS.

    Поддерживает:
    - смешанные дроби школьной программы (1\\frac{5}{14} -> 1 + 5/14 = 19/14);
    - десятичные запятые в условиях (2,4 -> 2.4);
    - полную нормализацию всех Unicode-минусов, тире, точек умножения и двоеточий;
    - арифметику всех уровней;
    - дроби, степени, корни, тригонометрию, логарифмы, константы pi и e;
    - уравнения и проверку корней подстановкой;
    - эквивалентность промежуточных математических выражений;
    - векторы любой размерности и их нормы;
    - безопасный парсинг без уязвимостей (защита от eval/exec инъекций).
    """

    # ================================================================
    # CONFIGURATION
    # ================================================================

    MAX_EXPRESSION_LENGTH = 4000

    EQUATION_TOLERANCE = 1e-8
    FINAL_ANSWER_TOLERANCE = 1e-8
    NUMERICAL_EQUIVALENCE_TOLERANCE = 1e-9

    # ================================================================
    # SYMPY TRANSFORMATIONS
    # ================================================================

    _TRANSFORMATIONS = (
        standard_transformations
        + (
            convert_xor,
            function_exponentiation,
            implicit_multiplication_application,
        )
    )

    # ================================================================
    # FUNCTIONS & CONSTANTS
    # ================================================================

    _FUNCTIONS = {
        "sin": sp.sin,
        "cos": sp.cos,
        "tan": sp.tan,
        "cot": sp.cot,
        "asin": sp.asin,
        "acos": sp.acos,
        "atan": sp.atan,
        "sinh": sp.sinh,
        "cosh": sp.cosh,
        "tanh": sp.tanh,
        "log": sp.log,
        "ln": sp.log,
        "sqrt": sp.sqrt,
        "exp": sp.exp,
        "Abs": sp.Abs,
        "abs": sp.Abs,
    }

    _CONSTANTS = {
        "pi": sp.pi,
        "E": sp.E,
        "e": sp.E,
        "I": sp.I,
        "oo": sp.oo,
    }

    _RESERVED_NAMES = set(_FUNCTIONS.keys()) | set(_CONSTANTS.keys())

    # ================================================================
    # NORMALIZATION
    # ================================================================

    def _normalize_text(self, expr: str) -> str:
        if expr is None:
            return ""

        result = str(expr).strip()

        # Все виды неразрывных пробелов
        result = re.sub(
            r"[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]",
            " ",
            result,
        )

        # LaTeX разделители
        result = result.replace("$$", "")
        result = result.replace("$", "")
        result = result.replace(r"\left", "")
        result = result.replace(r"\right", "")

        # Десятичные запятые в числах (2,4 -> 2.4)
        result = re.sub(r"(?<=\d),(?=\d)", ".", result)

        # ВСЕ ВИДЫ МИНУСОВ И ТИРЕ
        result = re.sub(
            r"[−–—―‒\u2212\u2013\u2014\u2015\u2012\u2011]",
            "-",
            result,
        )

        # ВСЕ ВИДЫ УМНОЖЕНИЯ
        result = re.sub(
            r"[×·∙⋅\u00D7\u00B7\u2219\u22C5]",
            "*",
            result,
        )
        result = result.replace(r"\cdot", "*")
        result = result.replace(r"\times", "*")

        # ВСЕ ВИДЫ ДЕЛЕНИЯ И ДВОЕТОЧИЙ
        result = re.sub(
            r"[÷∶∕⁄\u00F7\u2236\u2215\u2044]",
            "/",
            result,
        )
        result = re.sub(
            r"\s*:\s*",
            "/",
            result,
        )

        return result.strip()

    # ================================================================
    # MIXED FRACTIONS (СМЕШАННЫЕ ДРОБИ: 1\frac{5}{14} -> (1 + 5/14) = 19/14)
    # ================================================================

    def _convert_mixed_fractions(self, expr: str) -> str:
        """
        Преобразует смешанные дроби школьной программы в сложение целой и дробной части.
        Примеры:
        1\\frac{5}{14} -> ((1) + ((5)/(14)))
        5 1/4 -> ((5) + ((1)/(4)))
        """
        if not expr:
            return ""

        result = expr

        # 1. LaTeX-форма: 1\frac{5}{14} или 1 \frac{5}{14} или 1\dfrac{5}{14}
        mixed_latex_pattern = re.compile(
            r"(?<![a-zA-Z0-9_\.])(\d+)\s*\\(?:frac|dfrac|tfrac)\{([^{}]+)\}\{([^{}]+)\}"
        )
        for _ in range(10):
            new_result = mixed_latex_pattern.sub(
                lambda m: f"(({m.group(1)}) + (({m.group(2)})/({m.group(3)})))",
                result,
            )
            if new_result == result:
                break
            result = new_result

        # 2. Текстовая форма: 1 5/14 (целое число, пробел, простая дробь)
        mixed_text_pattern = re.compile(
            r"(?<![a-zA-Z0-9_\.\+\-\*\/\:\(])(\d+)\s+(\d+)\s*\/\s*(\d+)(?![a-zA-Z0-9_\.\+\-\*\/])"
        )
        for _ in range(10):
            new_result = mixed_text_pattern.sub(
                lambda m: f"(({m.group(1)}) + (({m.group(2)})/({m.group(3)})))",
                result,
            )
            if new_result == result:
                break
            result = new_result

        return result

    # ================================================================
    # LATEX FRACTIONS
    # ================================================================

    def _convert_fractions(self, expr: str) -> str:
        result = expr
        pattern = re.compile(
            r"\\(?:frac|dfrac|tfrac)\{([^{}]*)\}\{([^{}]*)\}"
        )

        for _ in range(50):
            new_result = pattern.sub(
                lambda m: f"(({m.group(1)})/({m.group(2)}))",
                result,
            )
            if new_result == result:
                break
            result = new_result

        return result

    # ================================================================
    # SQRT
    # ================================================================

    def _convert_sqrt(self, expr: str) -> str:
        result = expr
        pattern = re.compile(r"\\sqrt\{([^{}]*)\}")

        for _ in range(50):
            new_result = pattern.sub(
                lambda m: f"sqrt({m.group(1)})",
                result,
            )
            if new_result == result:
                break
            result = new_result

        result = result.replace(r"\sqrt", "sqrt")
        return result

    # ================================================================
    # LOGARITHMS
    # ================================================================

    def _convert_logs(self, expr: str) -> str:
        result = expr

        result = re.sub(
            r"\\log_\{([^{}]+)\}\s*\(([^()]*)\)",
            lambda m: f"log(({m.group(2)}),({m.group(1)}))",
            result,
        )
        result = re.sub(
            r"\\log_([A-Za-z0-9.+\-]+)\s*\(([^()]*)\)",
            lambda m: f"log(({m.group(2)}),({m.group(1)}))",
            result,
        )
        result = result.replace(r"\ln", "log")
        result = result.replace(r"\log", "log")
        return result

    # ================================================================
    # TRIGONOMETRY
    # ================================================================

    def _convert_trig(self, expr: str) -> str:
        result = expr
        funcs = ("sin", "cos", "tan", "cot")

        for func in funcs:
            result = re.sub(
                rf"\\{func}\^\{{(\d+)\}}\s*\(([^()]*)\)",
                lambda m, f=func: f"{f}({m.group(2)})**({m.group(1)})",
                result,
            )
            result = re.sub(
                rf"\\{func}\^(\d+)\s*\(([^()]*)\)",
                lambda m, f=func: f"{f}({m.group(2)})**({m.group(1)})",
                result,
            )
            result = re.sub(
                rf"\\{func}\s*\(([^()]*)\)\^(\d+)",
                lambda m, f=func: f"{f}({m.group(1)})**({m.group(2)})",
                result,
            )

        replacements = {
            r"\sin": "sin",
            r"\cos": "cos",
            r"\tan": "tan",
            r"\cot": "cot",
        }
        for source, target in replacements.items():
            result = result.replace(source, target)

        return result

    # ================================================================
    # LATEX -> SYMPY
    # ================================================================

    def _latex_to_sympy(self, expr: str) -> str:
        result = self._normalize_text(expr)
        if not result:
            return ""

        # Сначала преобразуем смешанные дроби (1\frac{5}{14} -> 1 + 5/14)
        result = self._convert_mixed_fractions(result)
        result = self._convert_fractions(result)
        result = self._convert_sqrt(result)
        result = self._convert_logs(result)
        result = self._convert_trig(result)

        replacements = {
            r"\pi": "pi",
            r"\exp": "exp",
            r"\infty": "oo",
            r"\mathrm{e}": "E",
        }
        for source, target in replacements.items():
            result = result.replace(source, target)

        result = result.replace("{", "(")
        result = result.replace("}", ")")
        result = result.replace("^", "**")

        result = re.sub(r"\s+", "", result)

        # Неявное умножение: 2x -> 2*x (но исключая hex-нотацию 0x)
        result = re.sub(r"(?<=\d)(?=[A-Za-z])", "*", result)

        return result

    # ================================================================
    # MATH TARGET EXTRACTION FROM TEXT
    # ================================================================

    def _extract_math_target(self, text: str) -> str:
        if text is None:
            return ""

        t = str(text).strip()
        if not t:
            return ""

        # 1. Если текст уже чистая формула
        clean_direct = self._latex_to_sympy(t)
        if clean_direct and self._is_safe_math_string(clean_direct):
            return t

        # 2. Извлечение из блоков $$...$$ или $...$
        dollar_matches = re.findall(r"\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$", t)
        if dollar_matches:
            for m in reversed(dollar_matches):
                candidate = (m[0] or m[1]).strip()
                if candidate:
                    clean_cand = self._latex_to_sympy(candidate)
                    if clean_cand and self._is_safe_math_string(clean_cand):
                        return candidate

        # 3. Нормализуем текст и ищем строку с математикой
        norm_text = self._normalize_text(t)

        lines = norm_text.splitlines()
        for line in reversed(lines):
            line_clean = line.strip()
            math_part = re.sub(
                r"^[А-Яа-яA-Za-z№\s\.:\-]+\s*", "", line_clean
            ).strip()
            if math_part:
                clean_cand = self._latex_to_sympy(math_part)
                if clean_cand and self._is_safe_math_string(clean_cand):
                    return math_part

        # 4. Поиск уравнений вида lhs = rhs
        eq_match = re.search(
            r"([A-Za-z0-9_+\-*/().^\s\\{}:]+\s*=\s*[A-Za-z0-9_+\-*/().^\s\\{}:]+)",
            norm_text,
        )
        if eq_match:
            cand = eq_match.group(1).strip()
            clean_cand = self._latex_to_sympy(cand)
            if clean_cand and self._is_safe_math_string(clean_cand):
                return cand

        # 5. Поиск арифметических выражений
        expr_match = re.search(
            r"(\d+[\d\s\+\-\*\/\:\.\^\\{\}]+\d+)", norm_text
        )
        if expr_match:
            cand = expr_match.group(1).strip()
            clean_cand = self._latex_to_sympy(cand)
            if clean_cand and self._is_safe_math_string(clean_cand):
                return cand

        return t

    # ================================================================
    # INPUT VALIDATION
    # ================================================================

    def _is_safe_math_string(self, expr: str) -> bool:
        if not expr:
            return False

        if len(expr) > self.MAX_EXPRESSION_LENGTH:
            return False

        forbidden = (
            "__",
            "import",
            "eval",
            "exec",
            "open",
            "globals",
            "locals",
            "getattr",
            "setattr",
            "lambda",
            "class",
            "def",
            "[",
            "]",
            "'",
            '"',
            ";",
            "`",
        )

        lowered = expr.lower()
        for token in forbidden:
            if token.lower() in lowered:
                return False

        if not re.fullmatch(r"[A-Za-z0-9_+\-*/().,=]*", expr):
            return False

        return True

    # ================================================================
    # SYMBOL DISCOVERY & NAMESPACE
    # ================================================================

    def _discover_symbols(self, expr: str) -> dict:
        identifiers = set(re.findall(r"\b[A-Za-z][A-Za-z0-9_]*\b", expr))
        symbols = {}
        for name in identifiers:
            if name in self._RESERVED_NAMES:
                continue
            symbols[name] = sp.Symbol(name)
        return symbols

    def _build_namespace(self, expr: str, extra_namespace: Optional[dict] = None) -> dict:
        namespace = {}
        namespace.update(self._FUNCTIONS)
        namespace.update(self._CONSTANTS)
        namespace.update(self._discover_symbols(expr))
        if extra_namespace:
            namespace.update(extra_namespace)
        return namespace

    # ================================================================
    # PARSER
    # ================================================================

    def _parse_sympy(self, expr: str, extra_namespace: Optional[dict] = None):
        if expr is None:
            return None

        expr = str(expr).strip()
        if not expr or not self._is_safe_math_string(expr):
            return None

        try:
            namespace = self._build_namespace(expr, extra_namespace)
            return parse_expr(
                expr,
                local_dict=namespace,
                transformations=self._TRANSFORMATIONS,
                evaluate=True,
            )
        except Exception:
            return None

    def _parse_math_expression(self, expr: str):
        clean = self._latex_to_sympy(expr)
        return self._parse_sympy(clean)

    # ================================================================
    # EQUATION & ROOT CHECK
    # ================================================================

    def _split_equation(self, equation: str):
        processed = self._latex_to_sympy(equation)
        if processed.count("=") != 1:
            return None
        lhs, rhs = processed.split("=", 1)
        if not lhs or not rhs:
            return None
        return lhs, rhs

    def _is_root_of_equation(self, equation: str, value, tolerance: float = EQUATION_TOLERANCE) -> bool:
        try:
            parts = self._split_equation(equation)
            if parts is None:
                return False

            lhs_text, rhs_text = parts
            lhs = self._parse_sympy(lhs_text)
            rhs = self._parse_sympy(rhs_text)

            if lhs is None or rhs is None:
                return False

            free_symbols = lhs.free_symbols | rhs.free_symbols
            if not free_symbols:
                return sp.simplify(lhs - rhs) == 0

            x_symbol = sp.Symbol("x")
            if x_symbol in free_symbols:
                target = x_symbol
            elif len(free_symbols) == 1:
                target = next(iter(free_symbols))
            else:
                return False

            difference = lhs - rhs
            substituted = difference.subs(target, value)

            if substituted.free_symbols:
                return False

            simplified = sp.simplify(substituted)
            if simplified == 0 or getattr(simplified, "is_zero", None) is True:
                return True

            numeric = sp.N(simplified, 50)
            if numeric.has(sp.nan, sp.zoo, sp.oo, -sp.oo):
                return False

            return abs(complex(numeric)) <= tolerance
        except Exception:
            return False

    # ================================================================
    # VECTOR OPERATIONS
    # ================================================================

    def _extract_vector_context(self, text: str) -> dict:
        vectors = {}
        pattern = re.compile(r"\b([A-Za-z][A-Za-z0-9_]*)\s*=\s*\(([^()]*)\)")

        for match in pattern.finditer(text):
            name = match.group(1)
            body = match.group(2)
            parts = re.split(r"[;,]", body)
            if len(parts) < 2:
                continue

            coordinates = []
            valid = True
            for part in parts:
                part = part.strip()
                if not re.fullmatch(r"[-+]?(?:\d+(?:\.\d+)?|\.\d+)", part):
                    valid = False
                    break
                coordinates.append(sp.sympify(part))

            if valid:
                vectors[name] = sp.Matrix(coordinates)

        return vectors

    def _extract_vector_expression(self, text: str) -> Optional[str]:
        match = re.search(
            r"(?:длина|модуль|норма)\s+(?:вектора\s+)?([A-Za-z0-9_+\-*/().^\s]+)",
            text,
            re.IGNORECASE,
        )
        if not match:
            return None
        expression = match.group(1)
        expression = re.split(r"[.!?]", expression, maxsplit=1)[0]
        return expression.strip()

    def _evaluate_vector_expression(self, expr: str, vectors: dict):
        try:
            clean = self._latex_to_sympy(expr)
            if not self._is_safe_math_string(clean):
                return None

            namespace = self._build_namespace(clean, extra_namespace=vectors)
            namespace.update(vectors)

            return parse_expr(
                clean,
                local_dict=namespace,
                transformations=self._TRANSFORMATIONS,
                evaluate=True,
            )
        except Exception:
            return None

    # ================================================================
    # SYMBOLIC & NUMERIC EQUALITY
    # ================================================================

    def _symbolically_equal(self, expr1, expr2) -> bool:
        try:
            difference = expr1 - expr2
        except Exception:
            return expr1 == expr2

        if difference == 0 or getattr(difference, "is_zero", None) is True:
            return True

        for simplify_fn in (sp.simplify, sp.trigsimp, lambda d: sp.cancel(sp.together(d)), sp.expand):
            try:
                if simplify_fn(difference) == 0:
                    return True
            except Exception:
                pass

        try:
            if expr1.equals(expr2) is True:
                return True
        except Exception:
            pass

        return False

    def _numerically_equal(self, expr1, expr2, tolerance: float = NUMERICAL_EQUIVALENCE_TOLERANCE) -> bool:
        try:
            difference = expr1 - expr2
        except Exception:
            return False

        symbols = sorted(difference.free_symbols, key=lambda s: s.name)
        if not symbols:
            try:
                value = sp.N(difference, 50)
                if value.has(sp.nan, sp.zoo, sp.oo, -sp.oo):
                    return False
                return abs(complex(value)) <= tolerance
            except Exception:
                return False

        test_values = [
            sp.Rational(1, 7),
            sp.Rational(1, 3),
            sp.Rational(1, 2),
            sp.Rational(2, 3),
            sp.Integer(1),
            sp.Rational(3, 2),
            sp.Integer(2),
            sp.Rational(5, 2),
            sp.Integer(3),
            -sp.Rational(1, 3),
            -sp.Rational(1, 2),
            -sp.Integer(1),
            -sp.Integer(2),
        ]

        valid_points = 0
        for offset in range(len(test_values)):
            substitutions = {
                symbol: test_values[(offset + index) % len(test_values)]
                for index, symbol in enumerate(symbols)
            }
            try:
                value = difference.subs(substitutions)
                if value.free_symbols:
                    continue
                value = sp.N(value, 50)
                if value.has(sp.nan, sp.zoo, sp.oo, -sp.oo):
                    continue
                numeric = complex(value)
                if not (math.isfinite(numeric.real) and math.isfinite(numeric.imag)):
                    continue
                valid_points += 1
                if abs(numeric) > tolerance:
                    return False
            except Exception:
                continue

        return valid_points >= 5

    def are_expressions_equivalent(self, expr1: str, expr2: str) -> bool:
        try:
            clean1 = self._latex_to_sympy(expr1)
            clean2 = self._latex_to_sympy(expr2)

            parsed1 = self._parse_sympy(clean1)
            parsed2 = self._parse_sympy(clean2)

            if parsed1 is None or parsed2 is None:
                return False

            if self._symbolically_equal(parsed1, parsed2):
                return True

            return self._numerically_equal(parsed1, parsed2)
        except Exception:
            return False

    # ================================================================
    # STUDENT VALUE PARSER (ПОДДЕРЖКА СМЕШАННЫХ ДРОБЕЙ И ДЕСЯТИЧНЫХ ЗАПЯТЫХ)
    # ================================================================

    def _parse_student_value(self, answer: str):
        if answer is None:
            return None

        text = str(answer).strip()
        if not text:
            return None

        if "=" in text:
            text = text.split("=", 1)[1].strip()

        # Десятичные запятые
        text = re.sub(r"(?<=\d),(?=\d)", ".", text)

        # Конвертируем смешанные дроби, если ученик ввел 5 1/4 или 5\frac{1}{4}
        text = self._convert_mixed_fractions(text)
        clean = self._latex_to_sympy(text)
        parsed = self._parse_sympy(clean)

        if parsed is None or parsed.free_symbols:
            return None

        return parsed

    # ================================================================
    # PUBLIC VERIFIERS
    # ================================================================

    def verify_equation_solution(self, task_context: str, student_input: str) -> dict:
        try:
            student_value = self._parse_student_value(student_input)
            if student_value is None:
                return {
                    "is_correct": False,
                    "message": "Не удалось распознать математический ответ",
                }

            task_math = self._extract_math_target(task_context)
            correct = self._is_root_of_equation(task_math, student_value)

            return {
                "is_correct": correct,
                "message": "Корень верный" if correct else "Корень неверный",
            }
        except Exception as e:
            return {
                "is_correct": False,
                "message": f"Ошибка: {type(e).__name__}: {e}",
            }

    def _compare_numeric_values(self, expected, student, tolerance: float = FINAL_ANSWER_TOLERANCE) -> bool:
        try:
            difference = sp.simplify(expected - student)
            if difference == 0 or getattr(difference, "is_zero", None) is True:
                return True

            if difference.free_symbols:
                return False

            value = sp.N(difference, 50)
            if value.has(sp.nan, sp.zoo, sp.oo, -sp.oo):
                return False

            return abs(complex(value)) <= tolerance
        except Exception:
            return False

    def verify_final_answer(self, task_context: str, student_answer: str) -> bool:
        """
        Проверяет одиночный математический ответ со 100% точностью SymPy CAS.
        """
        try:
            student_value = self._parse_student_value(student_answer)
            if student_value is None:
                return False

            task_raw = str(task_context).strip()
            if not task_raw:
                return False

            # 1. VECTOR
            vectors = self._extract_vector_context(task_raw)
            if vectors:
                vector_expression = self._extract_vector_expression(task_raw)
                if vector_expression:
                    vector_value = self._evaluate_vector_expression(vector_expression, vectors)
                    if vector_value is not None:
                        if isinstance(vector_value, sp.MatrixBase):
                            expected = sp.sqrt(vector_value.dot(vector_value))
                        else:
                            expected = vector_value
                        return self._compare_numeric_values(expected, student_value)

            # 2. ИЗВЛЕКАЕМ МАТЕМАТИЧЕСКИЙ ТАРГЕТ
            task = self._extract_math_target(task_raw)

            # 3. EQUATION
            if task.count("=") == 1:
                return self._is_root_of_equation(task, student_value)

            # 4. ARITHMETIC EXPRESSION (Вычисление выражения: 2.4 : (1 5/14 - 9/10) = 5.25)
            expected = self._parse_math_expression(task)
            if expected is None or expected.free_symbols:
                return False

            return self._compare_numeric_values(expected, student_value)

        except Exception:
            return False


# ====================================================================
# GLOBAL INSTANCE
# ====================================================================

math_verifier = MathVerifier()
