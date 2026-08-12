from typing import AsyncGenerator, Dict, Optional
from app.services.deepseek import deepseek_service
from app.domain.pedagogy.prompts import system_prompts
from app.domain.pedagogy.scaffolding import scaffolding_manager
from app.domain.sympy_engine.verifier import math_verifier


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

        active_task = task_context

        for msg in reversed(chat_history):
            text = msg.get("content", "")
            text_lower = text.lower()
            if "распознанный текст" in text_lower or "вектор" in text_lower:
                active_task = text
                break
            elif any(
                char in text for char in ["=", "+", "-", "*", "/", "^", "\\cos", "\\sin", "log", "нок"]
            ):
                if len(text) > 3 and not ("подсказк" in text_lower or "помоги" in text_lower):
                    active_task = text
                    break

        if any(char in student_input for char in ["=", "+", "-", "*", "/", "^"]) and not ("подсказк" in student_input.lower()):
            active_task = student_input

        level = scaffolding_manager.get_level(p_mastery)
        sympy_check = math_verifier.verify_equation_solution(
            active_task, student_input
        )

        sys_prompt = system_prompts.SOCRATIC_TUTOR.format(
            subject=subject,
            exam_type=exam_type,
            scaffolding_level=level.value,
            task_context=active_task,
            competency_title=competency_title,
            sympy_result=sympy_check["message"],
        )

        # ОСОБАЯ ИНСТРУКЦИЯ ДЛЯ СКАНИРОВАННЫХ КАРТОЧЕК
        if "сканированное упражнение" in active_task.lower() or "воспользуйтесь vision" in active_task.lower():
            hint_instruction = (
                "[ИНСТРУКЦИЯ ДЛЯ ИИ: Карточка является сканированной. "
                "Вежливо попроси ученика сфотографировать её решение/условие через Скрепку в чате "
                "или написать её текст, чтобы ты мог помочь с решением!]"
            )
        elif hint_type == "strong":
            hint_instruction = (
                f"[ИНСТРУКЦИЯ ДЛЯ ИИ: Условие задачи УЖЕ ИЗВЕСТНО: «{active_task}». "
                f"Подробно распиши выполнение первого шага этой конкретной задачи с формулами!]"
            )
        elif hint_type == "medium":
            hint_instruction = (
                f"[ИНСТРУКЦИЯ ДЛЯ ИИ: Условие задачи УЖЕ ИЗВЕСТНО: «{active_task}». "
                f"Напиши чёткий пошаговый алгоритм решения этой конкретной задачи.]"
            )
        elif hint_type == "light":
            hint_instruction = (
                f"[ИНСТРУКЦИЯ ДЛЯ ИИ: Условие задачи УЖЕ ИЗВЕСТНО: «{active_task}». "
                f"Назови только главное правило или первый шаг для этой конкретной задачи.]"
            )
        else:
            hint_instruction = (
                f"[ИНСТРУКЦИЯ ДЛЯ ИИ: Условие задачи УЖЕ ИЗВЕСТНО: «{active_task}». "
                f"Задай РОВНО ОДИН НАВОДЯЩИЙ ВОПРОС по первому шагу этой задачи!]"
            )

        guardrail_input = f"{student_input}\n\n{hint_instruction}"

        messages = [{"role": "system", "content": sys_prompt}]
        for msg in chat_history[-6:]:
            messages.append(msg)
        messages.append({"role": "user", "content": guardrail_input})

        async for chunk in deepseek_service.generate_stream(
            messages, temperature=0.1, hint_type=hint_type
        ):
            yield chunk


socratic_manager = SocraticDialogueManager()
