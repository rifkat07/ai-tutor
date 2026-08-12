import asyncio
from sqlalchemy import delete
from app.core.db import AsyncSessionLocal
from app.domain.models import RAGTask, TextbookExercise

PURGE_PATTERNS = [
    "%сканированное упражнение%",
    "%воспользуйтесь vision%",
    "%подписано в печать%",
    "%тираж%",
    "%печать офсетная%",
    "%гарнитура%",
    "%уч.-изд. л.%",
    "%бумага типографская%",
    "%ответы к заданиям%",
    "%таблица ответов%",
    "%№ ответ № ответ%",
    "%бланк ответов%",
    "%бланк регистрации%",
    "%код региона%",
    "%код предмета%",
    "%инструкция по выполнению%",
    "%èññëå%",
]


async def purge_all_trash():
    print("=" * 70)
    print("🧹 [PURGE] Зачистка базы от заглушек, бланков и мусора...")
    print("=" * 70)

    async with AsyncSessionLocal() as db:
        deleted_tasks = 0
        deleted_exercises = 0

        for pattern in PURGE_PATTERNS:
            res1 = await db.execute(
                delete(RAGTask).where(RAGTask.condition_text.ilike(pattern))
            )
            deleted_tasks += res1.rowcount

            res2 = await db.execute(
                delete(TextbookExercise).where(
                    TextbookExercise.condition_text.ilike(pattern)
                )
            )
            deleted_exercises += res2.rowcount

        await db.commit()
        print(f"✅ УДАЛЕНО ЗАГЛУШЕК И МУСОРА ИЗ БАНКА ЗАДАЧ: {deleted_tasks} записей!")
        print(f"✅ УДАЛЕНО ЗАГЛУШЕК И МУСОРА ИЗ УЧЕБНИКОВ: {deleted_exercises} записей!")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(purge_all_trash())
