import re
from typing import Optional
import sympy


class LaTeXParser:

    @staticmethod
    def clean_latex(latex_str: str) -> str:
        s = latex_str.strip()
        s = re.sub(r"\\left|\\right", "", s)
        s = re.sub(r"\\cdot", "*", s)
        s = re.sub(r"\\times", "*", s)
        if s.startswith("$") and s.endswith("$"):
            s = s[1:-1]
        return s.strip()

    @classmethod
    def to_sympy(cls, latex_str: str) -> Optional[sympy.Expr]:
        cleaned = cls.clean_latex(latex_str)
        try:
            from sympy.parsing.latex import parse_latex
            return parse_latex(cleaned)
        except Exception:
            try:
                formatted = cleaned.replace("^", "**")
                return sympy.sympify(formatted)
            except Exception:
                return None


latex_parser = LaTeXParser()
