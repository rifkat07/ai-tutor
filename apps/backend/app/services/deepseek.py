import asyncio
import json
import re
from typing import AsyncGenerator, Dict, List, Tuple
import httpx
from app.core.config import settings


class LLMService:
    """Сервис живого ИИ-диалога на модели Gemma 4 31B (Cerebras LPU)."""

    def _get_active_credentials(self) -> Tuple[str, str, Dict[str, str]]:
        raw_key = (
            getattr(settings, "CEREBRAS_API_KEY", None)
            or getattr(settings, "DEEPSEEK_API_KEY", None)
            or getattr(settings, "GROQ_API_KEY", None)
            or "csk-8xf9fk25menphrn6e4twexxt5px62v8kkmhkpmn4n3rytjp4"
        ).strip()

        endpoint = "https://api.cerebras.ai/v1/chat/completions"
        model = getattr(settings, "CEREBRAS_MODEL", None) or "gemma-4-31b"

        headers = {
            "Authorization": f"Bearer {raw_key}",
            "Content-Type": "application/json",
            "User-Agent": "Cerebras-Python-Client/1.0",
        }
        return (endpoint, model, headers)

    @staticmethod
    def _clean_text_output(text: str) -> str:
        if not text:
            return ""
        cleaned = re.sub(r"User Safety:\s*\w+\s*Response Safety:\s*\w+", "", text, flags=re.IGNORECASE)
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
        endpoint, model, headers = self._get_active_credentials()
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        try:
            async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
                res = await client.post(endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return self._clean_text_output(data["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"⚠️ Gemma 4 Exception: {e}")
        return ""

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 450,
        hint_type: str = None,
    ) -> AsyncGenerator[str, None]:
        endpoint, model, headers = self._get_active_credentials()
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
                async with client.stream("POST", endpoint, headers=headers, json=payload) as response:
                    if response.status_code != 200:
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
                                    if "<think>" in text_chunk:
                                        in_think_block = True
                                        continue
                                    if "</think>" in text_chunk:
                                        in_think_block = False
                                        text_chunk = text_chunk.split("</think>")[-1]

                                    if not in_think_block and text_chunk:
                                        yield text_chunk
                            except Exception:
                                continue
        except Exception as e:
            print(f"⚠️ Stream error: {e}")


deepseek_service = LLMService()
