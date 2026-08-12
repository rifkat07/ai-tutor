import json
from typing import Dict, Any
from app.services.deepseek import deepseek_service


class RussianEssayEvaluator:

    SYSTEM_PROMPT = """Ты — эксперт ФИПИ по проверке сочинения ЕГЭ по русскому языку (Задание 27).
Оцени текст строго по критериям К1-К12 и верни результат В СТРОГОМ JSON ФОРМАТЕ:
{
  "scores": {"K1": 1, "K2": 3, "K3": 1, "K4": 1, "K5": 2, "K6": 2, "K7": 3, "K8": 3, "K9": 2, "K10": 2, "K11": 1, "K12": 1},
  "total_score": 21,
  "detailed_feedback": "Детальный разбор ошибок и рекомендации"
}
"""

    async def evaluate_essay(
        self, source_text: str, student_essay: str
    ) -> Dict[str, Any]:
        user_message = f"ИСХОДНЫЙ ТЕКСТ:\n{source_text}\n\nСОЧИНЕНИЕ УЧЕНИКА:\n{student_essay}"
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ]
        response_str = await deepseek_service.generate_response(
            messages, temperature=0.1
        )
        try:
            return json.loads(response_str)
        except Exception:
            return {
                "total_score": 0,
                "detailed_feedback": response_str,
                "scores": {},
            }


essay_evaluator = RussianEssayEvaluator()
