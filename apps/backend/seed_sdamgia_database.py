import asyncio
import json
import re
from typing import List
from bs4 import BeautifulSoup
import httpx
from sqlalchemy import delete
from app.core.db import AsyncSessionLocal, Base, engine
from app.domain.models import SdamgiaVariant
from app.services.sdamgia_service import sdamgia_service
import app.domain.models  # noqa: F401

SUBJECT_TARGETS = [
    ("math", "EGE", "https://math-ege.sdamgia.ru"),
    ("math", "OGE", "https://math-oge.sdamgia.ru"),
    ("physics", "EGE", "https://phys-ege.sdamgia.ru"),
    ("cs", "EGE", "https://inf-ege.sdamgia.ru"),
    ("russian", "EGE", "https://rus-ege.sdamgia.ru"),
    ("chemistry", "EGE", "https://chem-ege.sdamgia.ru"),
]


async def discover_real_test_ids(main_url: str, limit: int = 10) -> List[str]:
    test_ids = []
    try:
        async with httpx.AsyncClient(timeout=15.0, verify=False) as client:
            res = await client.get(main_url, headers=sdamgia_service.HEADERS)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, "html.parser")
                links = soup.find_all(
                    "a", href=re.compile(r"/test\?id=\d+|/test\?a=custom")
                )
                seen = set()
                for a in links:
                    href = a.get("href", "")
                    match = re.search(r"id=(\d+)", href)
                    if match:
                        tid = match.group(1)
                        if tid not in seen:
                            seen.add(tid)
                            test_ids.append(tid)
                            if len(test_ids) >= limit:
                                break
    except Exception as e:
        print(f"⚠️ Ошибка сбора ссылок с {main_url}: {e}")

    if not test_ids:
        if "math-ege" in main_url:
            test_ids = [
                "5421822",
                "5421801",
                "5421098",
                "3120803",
                "3120804",
                "5421001",
            ]
        elif "math-oge" in main_url:
            test_ids = [
                "3120001",
                "3120002",
                "3120003",
                "3120004",
                "3120005",
                "3120006",
            ]
        elif "phys" in main_url:
            test_ids = ["5422001", "1054001", "1054002", "1054003", "1054004"]
        elif "inf" in main_url:
            test_ids = [
                "5423001",
                "5423002",
                "1124001",
                "1124002",
                "1124003",
                "1124004",
            ]
        elif "rus" in main_url:
            test_ids = ["5424001", "944001", "944002", "944003", "944004"]
        elif "chem" in main_url:
            test_ids = ["894001", "894002", "894003", "894004", "894005"]

    return test_ids


async def seed_sdamgia_database():
    print("=" * 70)
    print("📥 ПОЛНАЯ ОЧИСТКА И ПЕРЕЗАПИСЬ БАЗЫ ВАРИАНТОВ ИДЕАЛЬНЫМ LATEX")
    print("=" * 70)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("🧹 Принудительное удаление старого кэша в базе...")
        await db.execute(delete(SdamgiaVariant))
        await db.commit()

        total_saved = 0

        for subj, exam, main_url in SUBJECT_TARGETS:
            print(
                f"\n🌐 Сканирование вариантов [{subj.upper()} • {exam}]: {main_url}..."
            )
            real_ids = await discover_real_test_ids(main_url, limit=10)

            for idx, test_id in enumerate(real_ids, start=1):
                try:
                    res = await sdamgia_service.fetch_variant_online(
                        variant_id=test_id,
                        subject=subj,
                        exam_type=exam,
                    )

                    tasks = res.get("tasks", [])
                    if tasks:
                        db_variant = SdamgiaVariant(
                            id=test_id,
                            subject=subj,
                            exam_type=exam,
                            variant_number=f"Вариант №{idx}",
                            title=f"Вариант №{idx} (Тест #{test_id})",
                            url=res.get(
                                "source_url", f"{main_url}/test?id={test_id}"
                            ),
                            tasks_count=len(tasks),
                            tasks_data=json.dumps(tasks, ensure_ascii=False),
                        )
                        await db.merge(db_variant)
                        total_saved += 1
                        print(
                            f"    ✅ Сохранен {db_variant.title} ({len(tasks)} задач с чистейшим LaTeX)"
                        )
                except Exception as e:
                    print(f"    ⚠️ Ошибка теста {test_id}: {e}")

        await db.commit()
        print("\n" + "=" * 70)
        print(
            f"🎉 СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА! В базе сохранено {total_saved} кристально чистых вариантов!"
        )
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(seed_sdamgia_database())
