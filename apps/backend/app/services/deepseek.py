import asyncio
import json
import re
from typing import AsyncGenerator, Dict, List, Tuple
import httpx
from app.core.config import settings


class LLMService:
    """Сервис живого ИИ-диалога строго на модели Gemma 4 31B (Cerebras LPU)."""

    BROWSER_HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/event-stream, */*",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Origin": "https://cerebras.ai",
        "Referer": "https://cerebras.ai/",
    }

    def _get_active_credentials(self) -> Tuple[str, List[str], Dict[str, str]]:
        raw_key = (
            getattr(settings, "CEREBRAS_API_KEY", None)
            or getattr(settings, "DEEPSEEK_API_KEY", None)
            or getattr(settings, "GROQ_API_KEY", None)
            or "csk-8xf9fk25menphrn6e4twexxt5px62v8kkmhkpmn4n3rytjp4"
        ).strip()

        base_url_setting = (
            getattr(settings, "CEREBRAS_BASE_URL", None)
            or getattr(settings, "DEEPSEEK_BASE_URL", None)
            or getattr(settings, "GROQ_BASE_URL", None)
            or "https://api.cerebras.ai/v1"
        ).strip().rstrip("/")

        user_configured_model = (
            getattr(settings, "CEREBRAS_MODEL", None)
            or getattr(settings, "DEEPSEEK_CHAT_MODEL", None)
            or "gemma-4-31b"
        )

        if raw_key.startswith("csk-"):
            endpoint = "https://api.cerebras.ai/v1/chat/completions"
            candidate_models = [user_configured_model, "gemma-4-31b"]
        elif raw_key.startswith("gsk_"):
            endpoint = "https://api.groq.com/openai/v1/chat/completions"
            candidate_models = [user_configured_model, "gemma-4-31b", "gemma2-9b-it"]
        elif raw_key.startswith("sk-or-"):
            endpoint = "https://openrouter.ai/api/v1/chat/completions"
            candidate_models = [user_configured_model, "google/gemma-4-31b", "google/gemma-2-27b-it"]
        else:
            endpoint = (
                f"{base_url_setting}/chat/completions"
                if not base_url_setting.endswith("/chat/completions")
                else base_url_setting
            )
            candidate_models = [user_configured_model, "gemma-4-31b"]

        unique_models = []
        for m in candidate_models:
            if m and m not in unique_models:
                unique_models.append(m)

        headers = {
            **self.BROWSER_HEADERS,
            "Authorization": f"Bearer {raw_key}",
            "Content-Type": "application/json",
        }
        return (endpoint, unique_models, headers)

    @staticmethod
    def _clean_text_output(text: str) -> str:
        if not text:
            return ""
        cleaned = re.sub(
            r"User Safety:\s*\w+\s*Response Safety:\s*\w+",
            "",
            text,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(r"Response Safety:\s*\w+", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"User Safety:\s*\w+", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"<think>[\s\S]*?</think>", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"^[\s\S]*?</think>", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"<think>[\s\S]*$", "", cleaned, flags=re.IGNORECASE)
        return cleaned.strip()

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
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
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(45.0, connect=10.0),
                    follow_redirects=True,
                ) as client:
                    res = await client.post(endpoint, headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        raw_text = data["choices"][0]["message"]["content"]
                        return self._clean_text_output(raw_text)
                    else:
                        print(f"⚠️ Gemma 4 POST Error [{res.status_code}] for {model}: {res.text[:200]}")
            except Exception as e:
                print(f"⚠️ Gemma 4 Exception for {model}: {type(e).__name__}: {e}")
                continue

        return ""

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 450,
        hint_type: str = None,
    ) -> AsyncGenerator[str, None]:
        endpoint, models, headers = self._get_active_credentials()
        has_streamed_tokens = False

        for model in models:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True,
            }

            try:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(45.0, connect=10.0),
                    follow_redirects=True,
                ) as client:
                    async with client.stream("POST", endpoint, headers=headers, json=payload) as response:
                        if response.status_code != 200:
                            err_body = await response.aread()
                            print(f"⚠️ Gemma 4 Stream Error [{response.status_code}] for {model}: {err_body.decode('utf-8', errors='ignore')[:200]}")
                            continue

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
                                        if "User Safety:" in text_chunk or "Response Safety:" in text_chunk:
                                            continue
                                        if "<think>" in text_chunk:
                                            in_think_block = True
                                            continue
                                        if "</think>" in text_chunk:
                                            in_think_block = False
                                            text_chunk = text_chunk.split("</think>")[-1]

                                        if not in_think_block and text_chunk:
                                            has_streamed_tokens = True
                                            yield text_chunk

                                except (json.JSONDecodeError, KeyError, IndexError):
                                    continue

                        if has_streamed_tokens:
                            return

            except Exception as e:
                print(f"⚠️ Gemma 4 Stream error for {model}: {type(e).__name__}: {e}")
                if has_streamed_tokens:
                    return
                continue


deepseek_service = LLMService()
