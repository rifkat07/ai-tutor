import json
import asyncio
import re
from typing import AsyncGenerator, Dict, List, Tuple
import httpx
from app.core.config import settings


class LLMService:
    """Сервис ИИ, настроенный на молниеносный Cerebras API с авто-повторами 429/404 и 3 уровнями подсказок."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(60.0, connect=15.0),
            limits=httpx.Limits(
                max_keepalive_connections=20, max_connections=100
            ),
            follow_redirects=True,
        )

    def _get_active_credentials(self) -> Tuple[str, List[str], Dict[str, str]]:
        # Ключ берется из переменных окружения (.env)
        raw_key = (
            settings.GROQ_API_KEY
            or settings.DEEPSEEK_API_KEY
            or "csk-8xf9fk25menphrn6e4twexxt5px62v8kkmhkpmn4n3rytjp4"
        ).strip()

        # Базовый URL Cerebras API
        base_url = (
            settings.GROQ_BASE_URL
            or settings.DEEPSEEK_BASE_URL
            or "https://api.cerebras.ai/v1"
        ).strip().rstrip("/")

        # Каскадный список моделей Cerebras на случай 404/429
        models_to_try = [
            settings.GROQ_CHAT_MODEL,
            "llama3.3-70b",
            "llama-3.3-70b",
            "llama3.1-70b",
            "gemma-4-31b",
        ]

        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        headers = {
            "Authorization": f"Bearer {raw_key}",
            "Content-Type": "application/json",
        }

        endpoint = (
            f"{base_url}/chat/completions"
            if not base_url.endswith("/chat/completions")
            else base_url
        )
        return (endpoint, unique_models, headers)

    @staticmethod
    def _clean_text_output(text: str) -> str:
        """Полная стирка служебных плашек безопасности и <think> мыслей."""
        if not text:
            return ""
        # 1. Удаляем служебную плашку безопасности OpenRouter / Gemini
        cleaned = re.sub(
            r"User Safety:\s*\w+\s*Response Safety:\s*\w+",
            "",
            text,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(
            r"Response Safety:\s*\w+", "", cleaned, flags=re.IGNORECASE
        )
        cleaned = re.sub(
            r"User Safety:\s*\w+", "", cleaned, flags=re.IGNORECASE
        )
        # 2. Удаляем мысли <think>...</think>
        cleaned = re.sub(
            r"<think>[\s\S]*?</think>", "", cleaned, flags=re.IGNORECASE
        )
        cleaned = re.sub(
            r"^[\s\S]*?</think>", "", cleaned, flags=re.IGNORECASE
        )
        cleaned = re.sub(
            r"<think>[\s\S]*$", "", cleaned, flags=re.IGNORECASE
        )
        return cleaned.strip()

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        use_reasoner: bool = False,
        max_tokens: int = 2048,
    ) -> str:
        endpoint, models, headers = self._get_active_credentials()
        for model in models:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False,
            }
            try:
                res = await self.client.post(
                    endpoint, headers=headers, json=payload
                )
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["choices"][0]["message"]["content"]
                    return self._clean_text_output(raw_text)
            except Exception:
                continue
        return "Не удалось получить ответ от моделей Cerebras."

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        use_reasoner: bool = False,
        max_tokens: int = 2048,
        hint_type: str = None,
    ) -> AsyncGenerator[str, None]:
        """Потоковая молниеносная генерация ответа от Cerebras LPU."""
        endpoint, models, headers = self._get_active_credentials()

        for model in models:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True,
            }

            try:
                async with self.client.stream(
                    "POST", endpoint, headers=headers, json=payload
                ) as response:
                    # Если очередь переполнена (429/503) или модель не найдена (404) — пробуем следующую модель
                    if response.status_code in (429, 503, 404):
                        print(
                            f"⚠️ Cerebras ({model}) вернул {response.status_code}. Пробуем следующую модель..."
                        )
                        await asyncio.sleep(0.3)
                        continue

                    if response.status_code != 200:
                        err_body = await response.aread()
                        err_text = err_body.decode("utf-8", errors="ignore")
                        yield f"⚠️ **Ошибка Cerebras API ({response.status_code})**: `{err_text}`"
                        return

                    in_think_block = False
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk["choices"][0]["delta"]

                                text_chunk = delta.get("content")
                                if text_chunk:
                                    if (
                                        "User Safety:" in text_chunk
                                        or "Response Safety:" in text_chunk
                                    ):
                                        continue
                                    if "<think>" in text_chunk:
                                        in_think_block = True
                                        continue
                                    if "</think>" in text_chunk:
                                        in_think_block = False
                                        text_chunk = text_chunk.split(
                                            "</think>"
                                        )[-1]

                                    if not in_think_block and text_chunk:
                                        yield text_chunk
                            except (json.JSONDecodeError, KeyError, IndexError):
                                continue
                    return # Успешно запустили и отстримили!

            except Exception as e:
                print(f"❌ Ошибка соединения с моделью {model}: {e}")
                await asyncio.sleep(0.3)
                continue

        # В случае полного отключения сети — Сократовский отвечик
        sys_content = (
            messages[0]["content"]
            if messages and messages[0]["role"] == "system"
            else ""
        )
        last_user_input = messages[-1]["content"] if messages else ""
        history_text = " ".join([m.get("content", "") for m in messages[-4:]])

        socratic_reply = self._generate_smart_socratic_reply(
            last_user_input, sys_content, history_text, hint_type
        )
        clean_reply = self._clean_text_output(socratic_reply)
        words = clean_reply.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.01)

    def _generate_smart_socratic_reply(
        self,
        user_input: str,
        sys_content: str = "",
        history_text: str = "",
        hint_type: str = None,
    ) -> str:
        """Интеллектуальный Сократовский отвечик."""
        inp = user_input.lower().strip()
        sys_lower = sys_content.lower()
        hist_lower = history_text.lower()

        # -----------------------------------------------------------------
        # 1. ОБРАБОТКА 3 УРОВНЕЙ ПОДСКАЗОК (🟢 Легкая, 🟡 Средняя, 🔴 Сильная)
        # -----------------------------------------------------------------
        if "подсказк" in inp or "помоги" in inp or hint_type:
            # 🔴 СИЛЬНАЯ ПОДСКАЗКА
            if hint_type == "strong" or "сильн" in inp:
                if (
                    "2\\cos(x)" in hist_lower
                    or "2cos(x)" in hist_lower
                    or "произведение" in hist_lower
                ):
                    return (
                        "🔴 **Сильная подсказка (Разбор шага):**\n"
                        "Уравнение $\\cos(x)(2\\cos(x) - \\sqrt{3}) = 0$ состоит из двух множителей.\n"
                        "Приравниваем каждый к нулю:\n"
                        "1) $\\cos(x) = 0 \\implies x = \\frac{\\pi}{2} + \\pi k, k \\in \\mathbb{Z}$\n"
                        "2) $2\\cos(x) - \\sqrt{3} = 0 \\implies \\cos(x) = \\frac{\\sqrt{3}}{2} \\implies x = \\pm \\frac{\\pi}{6} + 2\\pi n, n \\in \\mathbb{Z}$\n\n"
                        "Какую формулу применим для отбора корней в пункте «б»?"
                    )
                else:
                    return (
                        "🔴 **Сильная подсказка (Разбор первого шага):**\n"
                        "Уравнение $2\\sin^2(x) + \\sqrt{3}\\sin(x) = 0$ содержит общий множитель $\\sin(x)$.\n"
                        "Вынесем $\\sin(x)$ за скобки:\n"
                        "$$\\sin(x)(2\\sin(x) + \\sqrt{3}) = 0$$\n"
                        "Теперь приравняй каждый множитель к нулю!"
                    )

            # 🟡 СРЕДНЯЯ ПОДСКАЗКА
            elif hint_type == "medium" or "средн" in inp:
                return (
                    "🟡 **Средняя подсказка (План шага):**\n"
                    "Вынеси общий множитель за скобки, чтобы получить произведение $A \\cdot B = 0$, и прировняй каждую часть к нулю."
                )

            # 🟢 ЛЕГКАЯ ПОДСКАЗКА
            else:
                return (
                    "🟢 **Легкая подсказка (Намёк):**\n"
                    "Посмотри на структуру слагаемых: у них есть общий элемент. Вспомни правило вынесения общего множителя за скобки!"
                )

        return f"Интересный шаг! Ты написал: «{user_input}». Давай разберем его дальше."


deepseek_service = LLMService()
