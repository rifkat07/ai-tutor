from app.services.deepseek import deepseek_service


class TaskGeneratorService:
    """Сервис 100% ИИ-генерации аналогичных задач без каких-либо захардкоженных шаблонов."""

    SYSTEM_PROMPT = """Ты — ведущий эксперт-составитель учебных заданий по предмету {subject} ({grade} класс, режим {exam_type}).

Твоя задача — сгенерировать ОДНО новое аналогичное упражнение строго по образцу, предоставленному пользователем.

ТРЕБОВАНИЯ:
1. Новая задача должна быть той же темы, того же раздела и той же сложности, но с другими числами, параметрами или данными.
2. Математические формулы и переменные оформляй строго в LaTeX ($x = 5$ или $$2x + 5 = 15$$).
3. Напиши ТОЛЬКО условие новой задачи без приветствий, комментариев и решения!
"""

    async def generate_similar_task(
        self, subject: str, grade: int, exam_type: str, task_context: str
    ) -> str:
        sys_prompt = self.SYSTEM_PROMPT.format(
            subject=subject, grade=grade, exam_type=exam_type
        )
        user_msg = (
            f"ОБРАЗЕЦ ЗАДАЧИ ДЛЯ ГЕНЕРАЦИИ 1 АНАЛОГА:\n{task_context}"
        )
        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_msg},
        ]
        try:
            return await deepseek_service.generate_response(
                messages, temperature=0.7
            )
        except Exception as e:
            print(f"❌ Task Generator Error: {e}")
            return task_context


task_generator_service = TaskGeneratorService()
