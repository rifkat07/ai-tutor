import json
from typing import Dict, Any
from app.services.deepseek import deepseek_service


class Part2Evaluator:

    SYSTEM_PROMPT = """Ты — ведущий эксперт ФИПИ по {subject}. Оцени решение задачи 2-й части.
Максимальный балл за задачу: {max_score}.
Верни ответ В СТРОГОМ JSON ФОРМАТЕ:
{{
  "score": 0,
  "max_score": {max_score},
  "frequently_lost_points_reason": "Причина снижения балла",
  "commentary": "Подробный разбор обоснований и вычислений"
}}
"""

    async def evaluate_solution(
        self,
        subject: str,
        task_condition: str,
        solution_text: str,
        max_score: int = 3,
    ) -> Dict[str, Any]:
        sys_p = self.SYSTEM_PROMPT.format(
            subject=subject, max_score=max_score
        )
        user_msg = f"УСЛОВИЕ ЗАДАЧИ:\n{task_condition}\n\nРЕШЕНИЕ УЧЕНИКА:\n{solution_text}"
        messages = [
            {"role": "system", "content": sys_p},
            {"role": "user", "content": user_msg},
        ]
        res = await deepseek_service.generate_response(
            messages, temperature=0.1
        )
        try:
            return json.loads(res)
        except Exception:
            return {
                "score": 0,
                "max_score": max_score,
                "commentary": res,
                "frequently_lost_points_reason": "Ошибка формата ответа",
            }


part2_evaluator = Part2Evaluator()
