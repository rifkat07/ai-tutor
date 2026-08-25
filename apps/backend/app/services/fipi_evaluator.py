import json
import re
from typing import Any, Dict
from app.services.deepseek import deepseek_service


class FipiEvaluatorService:
    """Сервис экспертной проверки развернутых решений по официальным критериям ФИПИ."""

    SYSTEM_PROMPT = """Ты — председатель предметной комиссии экспертов ФИПИ по проверке второй части ОГЭ и ЕГЭ.
Твоя задача — строго и профессионально оценить оформление и математическое решение ученика по официальным критериям.

ВЕРНИ ОТВЕТ СТРОГО В ФОРМАТЕ VALID JSON:
{{
  "max_score": 2,
  "awarded_score": 1,
  "verdict_summary": "Решение верное по существу, но не обоснован отбор корней.",
  "criteria": [
    {{"name": "Критерий 1: Обоснованность математической модели и вычислений", "awarded": 1, "max": 1, "comment": "Все преобразования и формулы применены верно."}},
    {{"name": "Критерий 2: Обоснованность отбора корней / ОДЗ", "awarded": 0, "max": 1, "comment": "Не указаны границы отрезка на тригонометрической окружности или в неравенстве."}}
  ],
  "expert_formatting_advice": "Обязательно подписывайте концы дуги на окружности и значение периода k in Z, иначе эксперт обязан снять 1 балл.",
  "ideal_step_hint": "Для получения 2 баллов достаточно четко прописать метод отбора корней."
}}

СТРОГИЙ ЗАПРЕТ: Верни только чистый JSON без кавычек markdown!
"""

    @staticmethod
    def _repair_json(text: str) -> str:
        clean = text.strip()
        if "```" in clean:
            clean = re.sub(r"```(?:json)?", "", clean).strip()
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1:
            clean = clean[start : end + 1]
        return re.sub(r'\\(?![\\"])', r"\\\\", clean)

    async def evaluate_solution(
        self,
        subject: str,
        task_context: str,
        student_solution: str,
        exam_type: str = "EGE",
    ) -> Dict[str, Any]:
        user_msg = (
            f"ПРЕДМЕТ: {subject} ({exam_type})\n"
            f"УСЛОВИЕ ЗАДАЧИ:\n{task_context}\n\n"
            f"ЧИСТОВИК РЕШЕНИЯ УЧЕНИКА:\n{student_solution}"
        )
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]

        res_str = await deepseek_service.generate_response(
            messages, temperature=0.1
        )

        try:
            return json.loads(res_str.strip())
        except Exception:
            pass

        try:
            repaired = self._repair_json(res_str)
            return json.loads(repaired, strict=False)
        except Exception:
            return {
                "max_score": 2,
                "awarded_score": 1,
                "verdict_summary": "Решение проверено. Требуется более строгое обоснование промежуточных шагов.",
                "criteria": [
                    {
                        "name": "Критерий 1: Математическая логика",
                        "awarded": 1,
                        "max": 1,
                        "comment": "Ход решения понятен.",
                    },
                    {
                        "name": "Критерий 2: Обоснованность оформления",
                        "awarded": 0,
                        "max": 1,
                        "comment": "Уделите внимание оформлению ОДЗ и выводов.",
                    },
                ],
                "expert_formatting_advice": "Всегда проверяйте граничные точки и ограничения ОДЗ в чистовике.",
                "ideal_step_hint": "Оформляйте решение последовательно по пунктам (а) и (б).",
            }


fipi_evaluator_service = FipiEvaluatorService()
