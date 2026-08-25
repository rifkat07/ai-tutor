import asyncio
from sqlalchemy import select
from app.core.db import AsyncSessionLocal, Base, engine
from app.domain.models import RAGTask
from app.services.embedding_service import embedding_service
import app.domain.models  # noqa: F401


async def index_all_tasks_embeddings():
    print("=" * 70)
    print("🧬 ИНДЕКСАЦИЯ И ВЕКТОРИЗАЦИЯ БАЗЫ ЗАДАЧ (1536-DIM PGVECTOR)")
    print("=" * 70)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        stmt = select(RAGTask)
        res = await db.execute(stmt)
        tasks = res.scalars().all()

        print(f"📚 Найдено {len(tasks)} задач для векторизации...")

        updated_count = 0
        for t in tasks:
            full_text = f"{t.task_number} {t.fipi_code or ''} {t.condition_text}"
            t.embedding = embedding_service.generate_embedding(full_text)
            updated_count += 1

        await db.commit()
        print(f"✅ УСПЕШНО СГЕНЕРИРОВАНО И ЗАПИСАНО {updated_count} ВЕКТОРОВ В БД!")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(index_all_tasks_embeddings())
