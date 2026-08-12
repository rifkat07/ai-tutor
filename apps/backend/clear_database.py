import asyncio
from sqlalchemy import text
from app.core.db import AsyncSessionLocal, Base, engine

# Обязательный импорт моделей для доступа к таблицам
import app.domain.models  # noqa: F401


async def clear_database():
    print("=" * 60)
    print("🧹 [AI-TUTOR DB WIPE] Очистка старых учебных материалов...")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        try:
            # Очищаем таблицы упражнений, учебников и банка задач
            await db.execute(text("DELETE FROM textbook_exercises;"))
            await db.execute(text("DELETE FROM textbooks;"))
            await db.execute(text("DELETE FROM rag_tasks_bank;"))
            await db.commit()
            print(
                "✅ Таблицы 'textbook_exercises', 'textbooks', 'rag_tasks_bank' полностью очищены!"
            )
        except Exception as e:
            await db.rollback()
            print(f"⚠️ Предупреждение при очистке: {e}")

    # Проверяем и восстанавливаем чистую структуру таблиц
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ База данных готова к чистой сплошной оцифровке!")


if __name__ == "__main__":
    asyncio.run(clear_database())
