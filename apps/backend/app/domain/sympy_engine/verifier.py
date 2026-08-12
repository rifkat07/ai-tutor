import sympy
from typing import Dict, Any
from app.domain.sympy_engine.latex_parser import latex_parser


class MathVerifier:

    @staticmethod
    def are_expressions_equivalent(expr_a_str: str, expr_b_str: str) -> bool:
        expr_a = latex_parser.to_sympy(expr_a_str)
        expr_b = latex_parser.to_sympy(expr_b_str)

        if expr_a is None or expr_b is None:
            return False

        try:
            diff = sympy.simplify(expr_a - expr_b)
            return bool(diff == 0 or diff.equals(0))
        except Exception:
            return False

    @staticmethod
    def verify_equation_solution(
        equation_str: str, student_solution_str: str, var_symbol: str = "x"
    ) -> Dict[str, Any]:
        x = sympy.Symbol(var_symbol)
        sol_expr = latex_parser.to_sympy(student_solution_str)

        if sol_expr is None:
            return {
                "is_valid": False,
                "error_type": "PARSING_ERROR",
                "message": "Не удалось разобрать выражение",
            }

        try:
            parts = equation_str.split("=")
            if len(parts) == 2:
                eq = sympy.Eq(
                    latex_parser.to_sympy(parts[0]),
                    latex_parser.to_sympy(parts[1]),
                )
            else:
                eq = sympy.Eq(latex_parser.to_sympy(equation_str), 0)

            substitutions = eq.subs(x, sol_expr)
            is_correct = bool(
                sympy.simplify(substitutions.lhs - substitutions.rhs) == 0
            )

            return {
                "is_valid": is_correct,
                "error_type": None if is_correct else "ARITHMETIC_OR_CONCEPTUAL",
                "message": (
                    "Решение верное"
                    if is_correct
                    else "Значение не обращает уравнение в тождество"
                ),
            }
        except Exception as e:
            return {
                "is_valid": False,
                "error_type": "VERIFICATION_FAILED",
                "message": str(e),
            }


math_verifier = MathVerifier()
