import json
import re
from typing import Any, Dict
from app.services.deepseek import deepseek_service


class DynamicTheoryService:
    """Сервис 100% динамической генерации ИИ-теории и Конспектов А4 строго без готовых ответов и расчетов."""

    SYSTEM_PROMPT = """Ты — ведущий эксперт-методист. Проанализируй предоставленное условие задачи.

Сгенерируй ответ СТРОГО В ФОРМАТЕ VALID JSON:
{{
  "cards": [
    {{"title": "1. Название правила", "content": "Общее правило или формула в LaTeX без численных расчетов и ответов!"}},
    {{"title": "2. Алгоритм решения", "content": "Пошаговый порядок действий в общем виде (БЕЗ промежуточных и финальных вычислений!)"}}
  ],
  "traps": [
    {{"title": "⚠️ Название типичной ошибки", "text": "В чем заключается главная ошибка 80% школьников в этой задаче"}}
  ],
  "feynmanQuestion": "Вопрос для проверки понятийного мышления Метод Фейнмана"
}}

СТРОЖАЙШИЙ ЗАПРЕТ:
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать любые числовые результаты вычислений или готовые ответы (ни промежуточные, ни итоговые)! Описывай только правила и алгоритм!
"""

    CHEATSHEET_PROMPT = """Ты — ведущий эксперт-составитель учебных пособий и конспектов по предмету {subject} ({grade} класс, режим {exam_type}).

Проанализируй предоставленное условие задачи и составь методический конспект-шпаргалку для листа А4 СТРОГО В JSON ФОРМАТЕ:
{{
  "formulas": [
    "$$Главная математическая формула$$",
    "$$\\text{{НОК}}(a, b) = c \\quad \\text{{(Любые русские слова внутри формул пиши строго в \\text{{...}})}}$$"
  ],
  "note": "* Краткая методическая подсказка к формулам",
  "steps": [
    {{"step": "Шаг 1", "title": "Название первого действия", "desc": "Методическое описание ЧТО нужно сделать (БЕЗ вычисления чисел и БЕЗ результатов!)"}},
    {{"step": "Шаг 2", "title": "Название промежуточного действия", "desc": "Методическое описание следующего шага (БЕЗ вычисления чисел и БЕЗ результатов!)"}},
    {{"step": "Шаг 3", "title": "Название финального действия", "desc": "Методическое описание завершения и проверки (БЕЗ числового ответа!)"}}
  ],
  "traps": [
    "• Главная ловушка этой темы, где ошибаются 80% школьников",
    "• Опасный момент со знаками или логикой вычислений"
  ]
}}

СТРОЖАЙШИЕ ПРАВИЛА И ЗАПРЕТЫ:
1. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать числовые результаты вычислений (ни промежуточные, ни итоговые) НИ НА ОДНОМ ИЗ ШАГОВ!
2. В формулах LaTeX ЛЮБОЙ русский текст (даже аббревиатуры НОК, НОД, S, P) ОБЯЗАТЕЛЬНО пиши внутри \\text{{...}} с пробелами!
   - ЗАПРЕЩЕНО: $$НОК(a, b) = a \cdot b$$
   - РАЗРЕШЕНО: $$\\text{{НОК}}(a, b) = a \cdot b$$
3. Верни ТОЛЬКО чистый JSON без кавычек markdown!
"""

    @staticmethod
    def _repair_json_string(json_str: str) -> str:
        text = json_str.strip()
        if "```" in text:
            text = re.sub(r"```(?:json)?", "", text).strip()

        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start : end + 1]

        text = text.replace(r"\t", r"\quad ")
        text = re.sub(r'(?<!\\)\\text', r'\\\\text', text)
        fixed_text = re.sub(r'\\(?![\\"])', r"\\\\", text)
        return fixed_text

    @classmethod
    def _extract_theory_from_raw_text(
        cls, text: str, competency_title: str
    ) -> Dict[str, Any]:
        cards = []
        traps = []
        feynman = f"как бы ты объяснил главную идею решения темы {competency_title} своими словами?"

        card_matches = re.findall(
            r'"title"\s*:\s*"([^"]+)"\s*,\s*"content"\s*:\s*"([^"]+)"', text
        )
        for title, content in card_matches[:3]:
            cards.append({"title": title.strip(), "content": content.strip()})

        trap_matches = re.findall(
            r'"title"\s*:\s*"([^"]+)"\s*,\s*"text"\s*:\s*"([^"]+)"', text
        )
        for title, trap_text in trap_matches[:2]:
            traps.append({"title": title.strip(), "text": trap_text.strip()})

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
                            "title": "⚠️ Внимание к вычислениям",
                            "text": "Будьте аккуратны при вычислениях!",
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

    @classmethod
    def _extract_cheatsheet_from_raw_text(
        cls, text: str, task_context: str
    ) -> Dict[str, Any]:
        formulas = []
        raw_formulas = re.findall(r'"formulas"\s*:\s*\[(.*?)\]', text, re.DOTALL)
        if raw_formulas:
            formula_items = re.findall(r'"([^"]+)"', raw_formulas[0])
            for f in formula_items:
                if len(f.strip()) > 3:
                    formulas.append(f.strip())

        steps = []
        step_blocks = re.findall(r'\{\s*"step"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"([^"]+)"\s*,\s*"desc"\s*:\s*"([^"]+)"\s*\}', text)
        for s, t, d in step_blocks[:3]:
            steps.append({"step": s.strip(), "title": t.strip(), "desc": d.strip()})

        traps = []
        raw_traps = re.findall(r'"traps"\s*:\s*\[(.*?)\]', text, re.DOTALL)
        if raw_traps:
            trap_items = re.findall(r'"([^"]+)"', raw_traps[0])
            for tr in trap_items:
                if len(tr.strip()) > 5:
                    traps.append(tr.strip())

        note_match = re.search(r'"note"\s*:\s*"([^"]+)"', text)
        note = note_match.group(1).strip() if note_match else "* Внимательно проверяйте порядок действий и знаки."

        if formulas or steps:
            return {
                "formulas": formulas if formulas else ["$$a + b - c + d = (a + b) - c + d \\quad \\text{(Порядок действий)}$$"],
                "note": note,
                "steps": steps if steps else [
                    {"step": "Шаг 1", "title": "Анализ структуры", "desc": "Определите порядок действий согласно правилам приоритета."},
                    {"step": "Шаг 2", "title": "Вычисления", "desc": "Выполните промежуточные действия по порядку в столбик."},
                    {"step": "Шаг 3", "title": "Проверка", "desc": "Выполните финальное действие и проверьте результат."}
                ],
                "traps": traps if traps else ["• Главная ошибка: нарушение последовательности выполнения операций."]
            }

        return {
            "formulas": ["$$a + b - c + d = (a + b) - c + d \\quad \\text{(Порядок действий)}$$"],
            "note": "* Внимательно проверяйте порядок действий и знаки.",
            "steps": [
                {
                    "step": "Шаг 1",
                    "title": "Анализ структуры выражения",
                    "desc": "Определите последовательность действий согласно правилам приоритета операций.",
                },
                {
                    "step": "Шаг 2",
                    "title": "Выполнение промежуточных действий",
                    "desc": "Выполните вычисления по порядку слева направо в столбик, контролируя переходы через разряды.",
                },
                {
                    "step": "Шаг 3",
                    "title": "Финальное действие и самопроверка",
                    "desc": "Завершите расчет последнего действия и проверьте ответ обратным действием.",
                },
            ],
            "traps": ["• Главная ошибка: нарушение последовательности выполнения операций."],
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

        try:
            clean_str = res_str.strip()
            if "```" in clean_str:
                clean_str = re.sub(r"```(?:json)?", "", clean_str).strip()
            return json.loads(clean_str)
        except Exception:
            pass

        try:
            repaired_json = self._repair_json_string(res_str)
            return json.loads(repaired_json, strict=False)
        except Exception:
            pass

        return self._extract_theory_from_raw_text(res_str, competency_title)

    async def generate_cheatsheet_a4(
        self,
        subject: str,
        grade: int,
        exam_type: str,
        task_context: str,
        competency_title: str,
    ) -> Dict[str, Any]:
        sys_prompt = self.CHEATSHEET_PROMPT.format(
            subject=subject, grade=grade, exam_type=exam_type
        )
        user_msg = (
            f"ТЕМА УРОКА: {competency_title}\n"
            f"УСЛОВИЕ ЗАДАЧИ:\n{task_context}\n\n"
            f"Составь методический конспект А4 (формулы, шаги 1-3 БЕЗ числовых результатов и ловушки) строго под эту задачу!"
        )

        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_msg},
        ]

        res_str = await deepseek_service.generate_response(
            messages, temperature=0.2
        )

        try:
            clean_str = res_str.strip()
            if "```" in clean_str:
                clean_str = re.sub(r"```(?:json)?", "", clean_str).strip()
            return json.loads(clean_str)
        except Exception:
            pass

        try:
            repaired_json = self._repair_json_string(res_str)
            return json.loads(repaired_json, strict=False)
        except Exception:
            pass

        return self._extract_cheatsheet_from_raw_text(res_str, task_context)


dynamic_theory_service = DynamicTheoryService()
