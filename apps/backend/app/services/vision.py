import json
import httpx
from app.core.config import settings
from app.services.deepseek import deepseek_service


class VisionOCRService:
    """Сервис анализа фото с тетрадей строго по Сократовскому методу без выдачи ответа."""

    SYSTEM_PROMPT = """Ты — ведущий эксперт-методист по распознаванию математических текстов и рукописных решений из тетрадей.
Перед тобой изображение тетрадного листа, книги или карточки с решением/условием задачи.

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ОТВЕТА:
1. Напиши: "📝 **Распознанный текст с фото:**" и дословно перепиши все уравнения, числа и текст с картинки в формате LaTeX ($inline$ или $$block$$).
2. Напиши: "🔍 **Анализ и свойства:**" и назови ключевую теорему или формулу. 
   КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО высчитывать и писать итоговый числовой ответ задачи! Оставь вычисления ученику!
3. Напиши: "💡 **Сократовский вопрос:**" и задай один наводящий вопрос по первому шагу вычислений.

Отвечай вежливо и только на русском языке!
"""

    async def analyze_notebook_photo(
        self, base64_image: str, task_context: str
    ) -> str:
        raw_key = (
            settings.GROQ_API_KEY
            or settings.DEEPSEEK_API_KEY
            or "csk-8xf9fk25menphrn6e4twexxt5px62v8kkmhkpmn4n3rytjp4"
        ).strip()

        base_url = (
            settings.GROQ_BASE_URL
            or settings.DEEPSEEK_BASE_URL
            or "https://api.cerebras.ai/v1"
        ).strip().rstrip("/")

        model = (
            settings.GROQ_CHAT_MODEL
            or settings.DEEPSEEK_CHAT_MODEL
            or "gemma-4-31b"
        )

        endpoint = (
            f"{base_url}/chat/completions"
            if not base_url.endswith("/chat/completions")
            else base_url
        )

        headers = {
            "Authorization": f"Bearer {raw_key}",
            "Content-Type": "application/json",
        }

        image_url = (
            base64_image
            if base64_image.startswith("data:image")
            else f"data:image/jpeg;base64,{base64_image}"
        )

        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Контекст темы: {task_context}\n\nВнимательно прочитай изображение, расшифруй рукописный текст и задай наводящий вопрос:",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url},
                    },
                ],
            },
        ]

        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.1,
            "max_tokens": 1500,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["choices"][0]["message"]["content"]
                    return deepseek_service._clean_text_output(raw_text)
                else:
                    fallback_messages = [
                        {"role": "system", "content": self.SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": f"Условие задачи: {task_context}. Разбери первое действие и задай наводящий вопрос без выдачи ответа!",
                        },
                    ]
                    return await deepseek_service.generate_response(
                        fallback_messages
                    )
        except Exception as e:
            print(f"❌ Cerebras Vision Error: {e}")
            fallback_messages = [
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Условие задачи: {task_context}. Разбери первое действие без выдачи ответа!",
                },
            ]
            return await deepseek_service.generate_response(
                fallback_messages
            )


vision_service = VisionOCRService()
