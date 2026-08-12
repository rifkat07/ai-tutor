import asyncio
from app.core.db import AsyncSessionLocal, Base, engine
from app.services.textbook_crawler import textbook_crawler

# Обязательный импорт всех моделей, чтобы SQLAlchemy знала обо всех таблицах
import app.domain.models  # noqa: F401


async def main():
    print("=" * 60)
    print("🌐 [AI-TUTOR CRAWLER] Проверка таблиц БД и запуск сбора учебников...")
    print("=" * 60)

    # 1. АВТО-СОЗДАНИЕ ВСЕХ ОТСУТСТВУЮЩИХ ТАБЛИЦ В БД
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Все таблицы базы данных (textbooks, exercises) проверены и созданы!")

    subjects = [
        "math",
        "algebra",
        "geometry",
        "physics",
        "chemistry",
        "cs",
        "russian",
    ]
    grades = [5, 6, 7, 8, 9, 10, 11]

    # 2. ОБХОД УЧЕБНИКОВ И ГДЗ
    async with AsyncSessionLocal() as db:
        for grade in grades:
            for subject in subjects:
                print(
                    f"🔍 Поиск учебников: [{subject.upper()}] — {grade} КЛАСС..."
                )
                try:
                    res = await textbook_crawler.auto_discover_and_ingest(
                        db, subject, grade
                    )
                    print(
                        f"✅ {res.get('textbook')}: +{res.get('auto_ingested_exercises')} упражнений"
                    )
                except Exception as e:
                    # Откатываем транзакцию при ошибке, чтобы сессия не заблокировалась
                    await db.rollback()
                    print(f"⚠️ Ошибка {subject} ({grade} кл): {e}")

                # Небольшая пауза между запросами
                await asyncio.sleep(1.0)

    print("\n" + "=" * 60)
    print("🎉 ВСЕГО УСПЕШНО ОЦИФРОВАНО И ДОБАВЛЕННО В БД!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
