import random
import sys
from pathlib import Path

import pytest


# ====================================================================
# PATH
# ====================================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(BACKEND_DIR),
    )


from app.domain.pedagogy.socratic import socratic_manager
from app.domain.sympy_engine.verifier import math_verifier


# ====================================================================
# RANDOM FACTORY
# ====================================================================

class RandomTaskFactory:
    """
    Детерминированный генератор математических задач.

    Используем отдельный Random instance,
    чтобы тесты не зависели от глобального random.
    """

    def __init__(
        self,
        seed: int = 20260816,
    ):
        self.random = random.Random(
            seed
        )

    # ================================================================
    # QUADRATIC
    # ================================================================

    def generate_random_quadratic_equation(
        self,
    ) -> dict:

        x1 = self.random.randint(
            -20,
            20,
        )

        x2 = self.random.randint(
            -20,
            20,
        )

        while x2 == x1:

            x2 = self.random.randint(
                -20,
                20,
            )

        wrong = self.random.randint(
            -25,
            25,
        )

        while wrong in (
            x1,
            x2,
        ):

            wrong = self.random.randint(
                -25,
                25,
            )

        b = -(x1 + x2)
        c = x1 * x2

        sign_b = (
            f"+ {b}"
            if b >= 0
            else f"- {abs(b)}"
        )

        sign_c = (
            f"+ {c}"
            if c >= 0
            else f"- {abs(c)}"
        )

        equation = (
            f"x^2 "
            f"{sign_b}x "
            f"{sign_c} = 0"
        )

        return {
            "equation": equation,
            "correct_roots": [
                str(x1),
                str(x2),
            ],
            "wrong_root": str(
                wrong
            ),
        }

    # ================================================================
    # TRIG
    # ================================================================

    def generate_random_trig_factoring(
        self,
    ) -> dict:

        a = self.random.randint(
            1,
            10,
        )

        b = self.random.randint(
            1,
            10,
        )

        func = self.random.choice(
            [
                "sin",
                "cos",
                "tan",
            ]
        )

        sign = self.random.choice(
            [
                "+",
                "-",
            ]
        )

        raw = (
            f"{a}\\{func}(x)^2 "
            f"{sign} "
            f"{b}\\{func}(x)"
        )

        factored = (
            f"\\{func}(x)"
            f"("
            f"{a}\\{func}(x) "
            f"{sign} "
            f"{b}"
            f")"
        )

        return {
            "raw_expr": raw,
            "factored_expr": factored,
        }

    # ================================================================
    # LOG
    # ================================================================

    def generate_random_log_equation(
        self,
    ) -> dict:

        base = self.random.choice(
            [
                2,
                3,
                5,
                7,
            ]
        )

        shift = self.random.randint(
            1,
            15,
        )

        power = self.random.randint(
            1,
            4,
        )

        correct = (
            base ** power
            - shift
        )

        wrong = correct + self.random.randint(
            1,
            10,
        )

        equation = (
            f"\\log_{{{base}}}"
            f"(x + {shift}) "
            f"= {power}"
        )

        return {
            "equation": equation,
            "correct_x": str(
                correct
            ),
            "wrong_x": str(
                wrong
            ),
        }


# ====================================================================
# TESTS
# ====================================================================

class TestRandomAIBenchmark:

    def test_random_quadratic_equations_batch(
        self,
    ):

        factory = RandomTaskFactory(
            seed=1001
        )

        for _ in range(100):

            task = (
                factory
                .generate_random_quadratic_equation()
            )

            for root in task[
                "correct_roots"
            ]:

                result = (
                    math_verifier
                    .verify_equation_solution(
                        task["equation"],
                        root,
                    )
                )

                assert (
                    result["is_correct"]
                    is True
                ), (
                    "Правильный корень отклонён: "
                    f"{task}"
                )

            wrong = (
                math_verifier
                .verify_equation_solution(
                    task["equation"],
                    task["wrong_root"],
                )
            )

            assert (
                wrong["is_correct"]
                is False
            ), (
                "Неверный корень принят: "
                f"{task}"
            )

    # ================================================================

    def test_random_trig_equivalence_batch(
        self,
    ):

        factory = RandomTaskFactory(
            seed=2002
        )

        for _ in range(100):

            task = (
                factory
                .generate_random_trig_factoring()
            )

            assert (
                math_verifier
                .are_expressions_equivalent(
                    task["raw_expr"],
                    task["factored_expr"],
                )
                is True
            ), task

    # ================================================================

    def test_random_log_equations_batch(
        self,
    ):

        factory = RandomTaskFactory(
            seed=3003
        )

        for _ in range(100):

            task = (
                factory
                .generate_random_log_equation()
            )

            correct = (
                math_verifier
                .verify_equation_solution(
                    task["equation"],
                    task["correct_x"],
                )
            )

            assert (
                correct["is_correct"]
                is True
            ), task

            # В старом тесте wrong_x генерировался,
            # но фактически НЕ проверялся.
            wrong = (
                math_verifier
                .verify_equation_solution(
                    task["equation"],
                    task["wrong_x"],
                )
            )

            assert (
                wrong["is_correct"]
                is False
            ), task

    # ================================================================

    @pytest.mark.asyncio
    async def test_socratic_agent_random_task_flow(
        self,
    ):

        factory = RandomTaskFactory(
            seed=4004
        )

        task = (
            factory
            .generate_random_quadratic_equation()
        )

        chunks = []

        async for chunk in (
            socratic_manager
            .generate_response_stream(
                subject="Математика",
                competency_title=(
                    "Квадратные уравнения"
                ),
                task_context=task[
                    "equation"
                ],
                student_input=(
                    "С чего начнем решение?"
                ),
                p_mastery=0.3,
                chat_history=[],
                exam_type="ОГЭ",
            )
        ):
            chunks.append(
                chunk
            )

        response = "".join(
            chunks
        ).strip()

        assert len(response) > 5

        assert "?" in response
