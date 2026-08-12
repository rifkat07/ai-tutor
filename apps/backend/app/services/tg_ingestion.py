import re
from typing import Dict, Any
from telethon import TelegramClient, events
from app.core.config import settings


class TelegramIngestionService:

    def __init__(self):
        self.client = TelegramClient(
            'ai_tutor_tg_session', 
            settings.TELEGRAM_API_ID, 
            settings.TELEGRAM_API_HASH
        )
        self.target_channels = [
            '@ege_math_fipi',
            '@kpolyakov_kege',
            '@ege_physics_fipi',
            '@rus_ege_expert'
        ]

    async def start_monitoring(self):
        @self.client.on(events.NewMessage(chats=self.target_channels))
        async def handler(event):
            text = event.message.message
            if self._is_ege_task(text):
                parsed_task = self._parse_task_structure(text)
                await self._save_to_rag_database(parsed_task)

        await self.client.start()
        print("📡 Telegram Ingestion Engine запущен...")

    def _is_ege_task(self, text: str) -> bool:
        keywords = ["Задание №", "КИМ", "СтатГрад", "Демоверсия", "Ответы в конце", "Дано:"]
        return any(kw in text for kw in keywords)

    def _parse_task_structure(self, text: str) -> Dict[str, Any]:
        task_num_match = re.search(r'(?:Задание|№)\s*(\d+)', text, re.IGNORECASE)
        task_num = task_num_match.group(1) if task_num_match else "Unknown"
        
        return {
            "task_number": task_num,
            "raw_text": text,
            "source": "Telegram_Live",
            "is_verified": False
        }

    async def _save_to_rag_database(self, task_data: Dict[str, Any]):
        print(f"📥 Новая задача из Telegram: №{task_data['task_number']}")


tg_ingestion_service = TelegramIngestionService()
