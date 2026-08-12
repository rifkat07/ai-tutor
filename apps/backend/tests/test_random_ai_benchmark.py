import os
import random
import sys
from pathlib import Path

# АВТО-ДОБАВЛЕНИЕ ПУТИ К БЭКЕНДУ В sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pytest
import sympy
from app.domain.pedagogy.socratic import socratic_manager
from app.domain.sympy_engine.latex_parser import latex_parser
from app.domain.sympy_engine.verifier import math_verifier


class RandomTaskFactory:
    """Генератор случайных математических задач в LaTeX формате для ЮНИТ-ТЕСТОВ."""

    @staticmethod
    def generate_random_quadratic_equation() -> dict:
        """Генерация случайного квадратного уравнения в стандартном LaTeX формате."""
        x1 = random.randint(-9, 9)
        x2 = random.randint(-9, 9)
        b = -(x1 + x2)
        c = x1 * x2

        sign_b = f"+ {b}" if b >= 0 else f"- {abs(b)}"
        sign_c = f"+ {c}" if c >= 0 else f"- {abs(c)}"

        # Формат LaTeX без оператора * (как пишут люди и ИИ)
        eq_str = f"x^2 {sign_b}x {sign_c} = 0"
        return {
            "equation": eq_str,
            "correct_roots": [str(x1), str(x2)],
            "wrong_root": str(x1 + random.choice([1, 2, 3, -1, -2])),
        }

    @staticmethod
    def generate_random_trig_factoring() -> dict:
        """Генерация случайного тригонометрического уравнения в LaTeX."""
        a = random.choice([2, 3, 4, 5])
        b = random.choice([1, 2, 3])
        sign = random.choice(["+", "-"])

        expr1 = f"{a}\\sin^2(x) {sign} {b}\\sin(x)"
        expr2 = f"\\sin(x)({a}\\sin(x) {sign} {b})"
        return {"raw_expr": expr1, "factored_expr": expr2}

    @staticmethod
    def generate_random_log_equation() -> dict:
        """Генерация случайного логарифмического уравнения в LaTeX."""
        base = random.choice([2, 3, 5])
        shift = random.randint(1, 10)
        power = random.randint(1, 3)

        exact_x = (base**power) - shift
        eq_str = f"\\log_{base}(x + {shift}) = {power}"
        return {
            "equation": eq_str,
            "correct_x": str(exact_x),
            "wrong_x": str(exact_x + 5),
        }


class TestRandomAIBenchmark:
    """Динамический тестовый комплекс со случайной генерацией задач."""

    def test_random_quadratic_equations_batch(self):
        """1. Тест 20 случайно сгенерированных квадратных уравнений через SymPy."""
        print(
            "\n🎲 [RANDOM TEST 1] Проверка 20 случайных квадратных уравнений..."
        )
        for i in range(20):
            task = RandomTaskFactory.generate_random_quadratic_equation()

            res_correct = math_verifier.verify_equation_solution(
                task["equation"], task["correct_roots"][0]
            )
            assert (
                res_correct["is_valid"] is True
            ), f"Ошибка на случайном уравнении {task['equation']}"

            res_wrong = math_verifier.verify_equation_solution(
                task["equation"], task["wrong_root"]
            )
            assert (
                res_wrong["is_valid"] is False
            ), f"Сбой: неверный корень принят как верный в {task['equation']}"

        print("✅ Все 20 случайных квадратных уравнений успешно пройдены!")

    def test_random_trig_equivalence_batch(self):
        """2. Тест 15 случайных тригонометрических преобразований через SymPy."""
        print(
            "\n🎲 [RANDOM TEST 2] Проверка 15 случайных тригонометрических вынесений за скобки..."
        )
        for i in range(15):
            task = RandomTaskFactory.generate_random_trig_factoring()
            is_eq = math_verifier.are_expressions_equivalent(
                task["raw_expr"], task["factored_expr"]
            )
            assert (
                is_eq is True
            ), f"Символьная неэквивалентность: {task['raw_expr']} != {task['factored_expr']}"

        print(
            "✅ Все 15 случайных тригонометрических преобразований тождественны!"
        )

    def test_random_log_equations_batch(self):
        """3. Тест 10 случайных логарифмических уравнений."""
        print(
            "\n🎲 [RANDOM TEST 3] Проверка 10 случайных логарифмических уравнений..."
        )
        for i in range(10):
            task = RandomTaskFactory.generate_random_log_equation()
            res = math_verifier.verify_equation_solution(
                task["equation"], task["correct_x"]
            )
            assert (
                res["is_valid"] is True
            ), f"Сбой логарифма: {task['equation']}"

        print("✅ Все 10 случайных логарифмических уравнений успешно решены!")

    @pytest.mark.asyncio
    async def test_socratic_agent_random_task_flow(self):
        """4. Интеграционный тест Сократовского ИИ на случайном уравнении."""
        print(
            "\n🎲 [RANDOM TEST 4] Проверка Сократовского ИИ на случайно сгенерированном уравнении..."
        )
        rand_task = RandomTaskFactory.generate_random_quadratic_equation()

        chunks = []
        async for chunk in socratic_manager.generate_response_stream(
            subject="Математика",
            competency_title="Квадратные уравнения",
            task_context=rand_task["equation"],
            student_input="С чего начнем решение?",
            p_mastery=0.3,
            chat_history=[],
            exam_type="ОГЭ",
        ):
            chunks.append(chunk)

        full_res = "".join(chunks)
        assert len(full_res) > 5, "ИИ ответил пустым сообщением"
        assert "?" in full_res, "ИИ должен завершить реплику вопросом"

        print(
            f"✅ Сократовский ИИ успешно отработал на случайной задаче: {rand_task['equation']}"
        )


if __name__ == "__main__":
    pytest.main(["-v", "-s", "-p", "no:faulthandler", __file__])
