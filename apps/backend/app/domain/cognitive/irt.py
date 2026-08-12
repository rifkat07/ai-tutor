import math
from typing import List, Dict


class IRTEngine:

    @staticmethod
    def _safe_exp(x: float) -> float:
        bounded_x = max(-500.0, min(500.0, x))
        return math.exp(bounded_x)

    @classmethod
    def probability(cls, theta: float, a: float, b: float) -> float:
        val = -a * (theta - b)
        return 1.0 / (1.0 + cls._safe_exp(val))

    @classmethod
    def update_theta(
        cls, current_theta: float, responses: List[Dict[str, float]]
    ) -> float:
        theta = current_theta
        for _ in range(5):
            num = 0.0
            den = 0.0
            for r in responses:
                a, b, y = r.get("a", 1.0), r.get("b", 0.0), r.get("correct", 0.0)
                p = cls.probability(theta, a, b)
                num += a * (y - p)
                den += (a**2) * p * (1.0 - p)
            if den < 1e-6:
                break
            theta = theta + (num / den)
        return min(max(theta, -3.0), 3.0)


irt_engine = IRTEngine()
