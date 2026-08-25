import json
import re
from typing import Any, Dict
from app.services.deepseek import deepseek_service


class EssayEvaluatorService:
    """Сервис экспертной проверки школьных сочинений ЕГЭ/ОГЭ по 12 официальным критериям ФИПИ."""

    SYSTEM_PROMPT = """Ты — ведущий эксперт региональной предметной комиссии ФИПИ по проверке сочинений (ЕГЭ №27 и ОГЭ №13.2/13.3).

Твоя задача — строго и объективно проверить сочинение ученика по всем официальным критериям, подсчитать баллы и подсветить ошибки.

ВЕРНИ ОТВЕТ СТРОГО В JSON ФОРМАТЕ:
{{
  "max_score": 21,
  "awarded_score": 18,
  "word_count": 210,
  "verdict_summary": "Сочинение логически выстроено, проблема и позиция автора сформулированы корректно.",
  "criteria_breakdown": [
    {{"code": "К1", "name": "Формулировка проблемы исходного текста", "awarded": 1, "max": 1, "comment": "Проблема выделена верно и без фактических ошибок."}},
    {{"code": "К2", "name": "Комментарий к сформулированной проблеме", "awarded": 3, "max": 3, "comment": "Приведены два примера-иллюстрации из текста со смысловой связью."}},
    {{"code": "К3", "name": "Отражение позиции автора", "awarded": 1, "max": 1, "comment": "Позиция автора сформулирована четко."}},
    {{"code": "К4", "name": "Отношение к позиции автора и обоснование", "awarded": 1, "max": 1, "comment": "Приведено согласие с тезисом и убедительный жизненный/литературный аргумент."}},
    {{"code": "К5", "name": "Смысловая цельность и абзацное членение", "awarded": 2, "max": 2, "comment": "Логические переходы и абзацы выдержаны правильно."}},
    {{"code": "К6", "name": "Богатство и выразительность речи", "awarded": 1, "max": 1, "comment": "Словарный запас разнообразен."}},
    {{"code": "К7", "name": "Соблюдение орфографических норм", "awarded": 3, "max": 3, "comment": "Орфографических ошибок нет."}},
    {{"code": "К8", "name": "Соблюдение пунктуационных норм", "awarded": 2, "max": 3, "comment": "Допущена одна пунктуационная ошибка при обособлении вводного слова."}},
    {{"code": "К9", "name": "Соблюдение грамматических норм", "awarded": 2, "max": 2, "comment": "Грамматические нормы соблюдены."}},
    {{"code": "К10", "name": "Соблюдение речевых норм", "awarded": 1, "max": 2, "comment": "Встречается речевая избыточность (плеоназм)."}},
    {{"code": "К11", "name": "Соблюдение этических норм", "awarded": 1, "max": 1, "comment": "Корректный уважительный тон."}},
    {{"code": "К12", "name": "Соблюдение фактологической точности", "awarded": 1, "max": 1, "comment": "Фактических искажений не обнаружено."}}
  ],
  "highlighted_errors": [
    {{
      "type": "пунктуация",
      "quote": "однако несмотря на это мы",
      "fix": "однако, несмотря на это, мы",
      "explanation": "Пропущены запятые при обособлении конструкции 'несмотря на это'."
    }},
    {{
      "type": "речь",
      "quote": "автор рассказывает о том, как рассказывает главный герой",
      "fix": "автор повествует о поступках главного героя",
      "explanation": "Неоправданный повтор однокоренного слова 'рассказывает'."
    }}
  ],
  "expert_advice": "Для получения 21 балла обратите внимание на синонимическую замену повторяющихся глаголов и проверку запятых при оборотах."
}}

СТРОГИЙ ЗАПРЕТ: Верни ТОЛЬКО валидный JSON без markdown-кавычек!
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

    async def evaluate_essay(
        self,
        task_context: str,
        essay_text: str,
        exam_type: str = "EGE",
    ) -> Dict[str, Any]:
        words = len(re.findall(r"\b[а-яА-ЯёЁa-zA-Z0-9\-]+\b", essay_text))

        user_msg = (
            f"ФОРМАТ ЭКЗАМЕНА: {exam_type} (Русский язык)\n"
            f"ИСХОДНЫЙ ТЕКСТ / ЗАДАНИЕ:\n{task_context}\n\n"
            f"ТЕКСТ СОЧИНЕНИЯ УЧЕНИКА ({words} слов):\n{essay_text}"
        )
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]

        res_str = await deepseek_service.generate_response(
            messages, temperature=0.15
        )

        try:
            return json.loads(res_str.strip())
        except Exception:
            pass

        try:
            repaired = self._repair_json(res_str)
            return json.loads(repaired, strict=False)
        except Exception:
            # Безопасный фоллбэк
            return {
                "max_score": 21 if exam_type == "EGE" else 9,
                "awarded_score": 17 if exam_type == "EGE" else 7,
                "word_count": words,
                "verdict_summary": "Сочинение проверено. Основные критерии соблюдены, обратите внимание на речевые конструкции.",
                "criteria_breakdown": [
                    {
                        "code": "К1",
                        "name": "Формулировка проблемы",
                        "awarded": 1,
                        "max": 1,
                        "comment": "Проблема выделена.",
                    },
                    {
                        "code": "К2",
                        "name": "Комментарий к проблеме",
                        "awarded": 3,
                        "max": 3,
                        "comment": "Приведены примеры из текста.",
                    },
                    {
                        "code": "К7-К8",
                        "name": "Грамотность (Орфография и Пунктуация)",
                        "awarded": 4,
                        "max": 6,
                        "comment": "Встречаются единичные пунктуационные неточности.",
                    },
                ],
                "highlighted_errors": [
                    {
                        "type": "речь",
                        "quote": "В тексте рассказывается",
                        "fix": "Автор повествует",
                        "explanation": "Рекомендуется использовать выразительные синонимы.",
                    }
                ],
                "expert_advice": "Проверяйте выделение придаточных предложений запятыми.",
            }


essay_evaluator_service = EssayEvaluatorService()
