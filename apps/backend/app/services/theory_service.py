import json
import re
from typing import Any, Dict
from app.services.deepseek import deepseek_service


class DynamicTheoryService:
    """Сервис 100% динамической генерации ИИ-теории с неразрушимым 3-уровневым парсером."""

    SYSTEM_PROMPT = """Ты — ведущий эксперт-методист. Проанализируй предоставленное условие задачи.

Сгенерируй ответ СТРОГО В ФОРМАТЕ VALID JSON:
{{
  "cards": [
    {{"title": "1. Название правила", "content": "Короткая шпаргалка с LaTeX формулой $...$"}},
    {{"title": "2. Ключевой шаг", "content": "Алгоритм с LaTeX формулой $$...$$"}}
  ],
  "traps": [
    {{"title": "⚠️ Название типичной ошибки", "text": "В чем заключается главная ошибка 80% школьников в этой задаче"}}
  ],
  "feynmanQuestion": "Вопрос для проверки понятийного мышления Метод Фейнмана"
}}

ВАЖНО: Пиши обратные слэши в LaTeX с двойным экранированием: \\\\frac, \\\\sqrt, \\\\sin, \\\\cos.
Верни СТРОГО чистый JSON!
"""

    @staticmethod
    def _repair_json_string(json_str: str) -> str:
        """Экранирует одиночные слэши в JSON строке."""
        text = json_str.strip()
        if "```" in text:
            text = re.sub(r"```(?:json)?", "", text).strip()

        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start : end + 1]

        # Экранируем каждый слэш LaTeX
        fixed = re.sub(r'\\(?![\\"])', r"\\\\", text)
        return fixed

    @classmethod
    def _extract_theory_from_raw_text(
        cls, text: str, competency_title: str
    ) -> Dict[str, Any]:
        """БРОНЕБОЙНЫЙ извлекатель данных напрямую из текста ИИ без помощи json.loads."""
        cards = []
        traps = []
        feynman = f"как бы ты объяснил главную идею решения темы {competency_title} своими словами?"

        # 1. Извлекаем блоки карточек "title": "...", "content": "..."
        card_matches = re.findall(
            r'"title"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"([^"]+)"', text
        )
        for title, content in card_matches[:3]:
            cards.append({"title": title.strip(), "content": content.strip()})

        # 2. Извлекаем ловушки "title": "...", "text": "..."
        trap_matches = re.findall(
            r'"title"\s*:\s*"([^"]+)"\s*,\s*"text"\s*:\s*"([^"]+)"', text
        )
        for title, trap_text in trap_matches[:2]:
            traps.append({"title": title.strip(), "text": trap_text.strip()})

        # 3. Извлекаем вопрос Фейнмана
        fey_match = re.search(r'"feynmanQuestion"\s*:\s*"([^"]+)"', text)
        if fey_match:
            feynman = fey_match.group(1).strip()

        if cards or traps:
            return {
                "cards": (
                    cards
                    if cards
                    else [
                        {
                            "title": "1. Ключевой принцип темы",
                            "content": f"Разбор темы {competency_title}",
                        }
                    ]
                ),
                "traps": (
                    traps
                    if traps
                    else [
                        {
                            "title": "⚠️ Внимание к расчетам",
                            "text": "Будьте аккуратны при переносе слагаемых и раскрытии скобок!",
                        }
                    ]
                ),
                "feynmanQuestion": feynman,
            }

        return {
            "cards": [
                {
                    "title": "1. Основной принцип решения",
                    "content": f"Для решения задачи по теме *{competency_title}* выполните ключевые преобразования.",
                }
            ],
            "traps": [
                {
                    "title": "⚠️ Внимание к вычислениям",
                    "text": "Внимательно следите за знаками!",
                }
            ],
            "feynmanQuestion": feynman,
        }

    async def generate_task_theory(
        self, subject: str, task_context: str, competency_title: str
    ) -> Dict[str, Any]:
        user_msg = f"ПРЕДМЕТ: {subject}\nТЕМА: {competency_title}\nУСЛОВИЕ ЗАДАЧИ:\n{task_context}"
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]

        res_str = await deepseek_service.generate_response(
            messages, temperature=0.1
        )

        # УРОВЕНЬ 1: Прямой парсинг чистого JSON
        try:
            clean_str = res_str.strip()
            if "```" in clean_str:
                clean_str = re.sub(r"```(?:json)?", "", clean_str).strip()
            return json.loads(clean_str)
        except Exception:
            pass

        # УРОВЕНЬ 2: Авто-ремонт слэшей LaTeX
        try:
            repaired_json = self._repair_json_string(res_str)
            return json.loads(repaired_json, strict=False)
        except Exception:
            pass

        # УРОВЕНЬ 3: Прямое извлечение данных из текста ИИ без json.loads!
        print("⚠️ [Theory Parser] Прямое извлечение теории из текста ИИ!")
        return self._extract_theory_from_raw_text(res_str, competency_title)


dynamic_theory_service = DynamicTheoryService()
