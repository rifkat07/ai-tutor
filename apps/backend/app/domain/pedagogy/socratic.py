import re
from typing import AsyncGenerator, Dict, Optional
from bs4 import BeautifulSoup
from app.domain.pedagogy.scaffolding import scaffolding_manager
from app.domain.sympy_engine.verifier import math_verifier
from app.services.deepseek import deepseek_service

SOCRATIC_MASTER_PROMPT = """Ты — опытный, чуткий и высококвалифицированный ИИ-репетитор по предмету {subject} ({exam_type}).
Твоя цель — вести ученика к самостоятельному решению методом Сократа (конкретными наводящими вопросами и подсказками), не называя готовый итоговый ответ!

ТЕКУЩИЙ УРОВЕНЬ ПОДДЕРЖКИ (Scaffolding): {scaffolding_level}
РЕЗУЛЬТАТ ПРОВЕРКИ СИМВОЛЬНЫМ ДВИЖКОМ: {sympy_result}

УСЛОВИЕ ТЕКУЩЕЙ ЗАДАЧИ:
«{task_context}»
ТЕМА УРОКА: {competency_title}

СТРОЖАЙШИЕ ПРАВИЛА:
1. Условие задачи «{task_context}» УЖЕ ЗАГРУЖЕНО И НАХОДИТСЯ ПЕРЕД ТОБОЙ! СРАЗУ веди разбор именно этой задачи!
   КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать «я не могу приступить», «пришлите текст» или выдумывать посторонние уравнения!
2. МГНОВЕННЫЙ ОТВЕТ НА ЗАПРОСЫ ПОДСКАЗОК (🟢 Легкая / 🟡 Средняя / 🔴 Сильная):
   - СРАЗУ без лишних вступлений выдавай содержательную подсказку СТРОГО ПО ТЕКУЩЕМУ ШАГУ задачи «{task_context}»!
   - 🟢 Легкая: короткий наводящий намёк на следующее действие или формулу.
   - 🟡 Средняя: пошаговый план из оставшихся шагов с формулами.
   - 🔴 Сильная: подробная инструкция выполнения шага с формулами и числами (но финальный расчет оставь ученику).
"""


def _extract_readable_text_for_ai(html_or_text: str) -> str:
    """Превращает HTML-условие с тегами <img alt='...'> в чистый математический текст, понятный ИИ."""
    if not html_or_text:
        return "Математическая задача"

    soup = BeautifulSoup(html_or_text, "html.parser")

    # Заменяем картинки формул на их текстовый эквивалент из alt
    for img in soup.find_all("img"):
        alt = img.get("alt", "").strip()
        if alt:
            img.replace_with(f" {alt} ")
        else:
            img.replace_with(" ")

    text = soup.get_text(separator=" ", strip=True)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


class SocraticDialogueManager:

    async def generate_response_stream(
        self,
        subject: str,
        competency_title: str,
        task_context: str,
        student_input: str,
        p_mastery: float,
        chat_history: list[Dict[str, str]],
        hint_type: Optional[str] = None,
        exam_type: str = "ЕГЭ",
    ) -> AsyncGenerator[str, None]:

        # 1. Распаковываем условие задачи в понятный для нейросети текст с формулами!
        active_task = _extract_readable_text_for_ai(task_context)

        # 2. Авто-определение типа подсказки
        in_lower = student_input.lower().strip()
        effective_hint = hint_type
        if not effective_hint:
            if "сильн" in in_lower:
                effective_hint = "strong"
            elif "средн" in in_lower or "пошагов" in in_lower or "план" in in_lower:
                effective_hint = "medium"
            elif (
                "легк" in in_lower
                or "намёк" in in_lower
                or "намек" in in_lower
                or "подсказк" in in_lower
            ):
                effective_hint = "light"

        level = scaffolding_manager.get_level(p_mastery)
        sympy_check = math_verifier.verify_equation_solution(
            active_task, student_input
        )

        hint_instruction = ""
        if effective_hint == "strong":
            hint_instruction = (
                f"\n\n[ДЕЙСТВИЕ: Ученик запросил СИЛЬНУЮ ПОДРОБНУЮ ПОДСКАЗКУ по текущему шагу задачи «{active_task}». "
                f"Сразу дай детальный разбор техники выполнения текущего шага с формулами без лишних вступлений!]"
            )
        elif effective_hint == "medium":
            hint_instruction = (
                f"\n\n[ДЕЙСТВИЕ: Ученик запросил СРЕДНЮЮ ПОДСКАЗКУ (пошаговый план) по задаче «{active_task}». "
                f"Сразу распиши четкий пошаговый план оставшихся шагов с формулами!]"
            )
        elif effective_hint == "light":
            hint_instruction = (
                f"\n\n[ДЕЙСТВИЕ: Ученик запросил ЛЕГКУЮ ПОДСКАЗКУ-НАМЁК по задаче «{active_task}». "
                f"Сразу назови главное правило или подскажи конкретное первое действие!]"
            )

        full_sys_prompt = f"{SOCRATIC_MASTER_PROMPT.format(subject=subject, exam_type=exam_type, scaffolding_level=level.value, task_context=active_task, competency_title=competency_title, sympy_result=sympy_check['message'])}{hint_instruction}"

        # 3. Очищаем историю чата от старых системных сообщений
        cleaned_history = []
        last_added_content = ""

        for msg in chat_history[-16:]:
            role = msg.get("role", "user")
            content = (msg.get("content") or "").strip()

            if not content:
                continue
            if "загружено задание" in content.lower():
                continue
            if "ЗАПРОС:" in content or "ДЕЙСТВИЕ:" in content:
                continue
            if "подсказк" in content.lower() and content == last_added_content:
                continue

            cleaned_history.append({"role": role, "content": content})
            last_added_content = content

        formatted_messages = [{"role": "system", "content": full_sys_prompt}]
        for msg in cleaned_history:
            if formatted_messages[-1]["role"] == msg["role"]:
                formatted_messages[-1]["content"] += "\n" + msg["content"]
            else:
                formatted_messages.append(msg)

        if formatted_messages[-1]["role"] == "user":
            formatted_messages[-1]["content"] += "\n" + student_input.strip()
        else:
            formatted_messages.append(
                {"role": "user", "content": student_input.strip()}
            )

        async for chunk in deepseek_service.generate_stream(
            formatted_messages, temperature=0.3, hint_type=effective_hint
        ):
            yield chunk


socratic_manager = SocraticDialogueManager()
