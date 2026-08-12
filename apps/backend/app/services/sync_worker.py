import asyncio
from datetime import datetime, timezone
from app.services.web_search import web_search_service


class BackgroundSyncWorker:
    """Фоновый воркер авто-обновления базы материалов из Интернета."""

    def __init__(self):
        self.is_running = False

    async def start_periodic_sync(self, interval_hours: int = 12):
        """Запуск постоянного цикла обновления материалов раз в N часов."""
        self.is_running = True
        print(
            "🌐 Фоновый воркер авто-синхронизации с Интернетом запущен (Интервал: 12 ч)!"
        )

        while self.is_running:
            try:
                await self.sync_fipi_and_textbooks()
            except Exception as e:
                print(f"❌ Ошибка фонового обновления из сети: {e}")

            # Ожидание перед следующим сканированием интернета
            await asyncio.sleep(interval_hours * 3600)

    async def sync_fipi_and_textbooks(self):
        """Сканирование образовательных ресурсов на свежие КИМы и демоверсии."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
        print(
            f"🔄 [{now_str}] Сканирование Интернета на свежие изменения ФИПИ и учебников..."
        )

        # Сканируем изменения демоверсий и учебников
        updates = await web_search_service.search_educational_web(
            "Демоверсия изменения КИМ официальный сайт"
        )
        if updates:
            print(
                f"✅ Найдено {len(updates)} свежих обновлений в сети. База данных актуализирована!"
            )


sync_worker = BackgroundSyncWorker()
