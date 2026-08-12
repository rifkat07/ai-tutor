import asyncio
import os
import re
import uuid
from app.core.db import AsyncSessionLocal, Base, engine
from app.domain.models import RAGTask, Textbook, TextbookExercise
from app.services.pdf_ingestion import pdf_ingestion_service

import app.domain.models  # noqa: F401

BASE_PROJECT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
PDF_DATABASE_DIR = os.path.join(BASE_PROJECT_DIR, "database_pdf_materials")

TEACHER_GUIDE_KEYWORDS = [
    "методическ", "учител", "поурочн", "рабочая программа", "планирование", "пособие для учителя"
]

FORBIDDEN_EXAM_SUBJECTS = [
    "истори", "литератур", "биолог", "обществозн", "географ", "англ", "немецк"
]


def detect_metadata_from_filename(
    filename: str, folder_name: str
) -> tuple[str, int, str]:
    fn_lower = filename.lower()
    folder_lower = folder_name.lower()

    grade = 5
    grade_match = re.search(
        r"\b(5|6|7|8|9|10|11)\b(?:\s*|-)*(?:кл|класс)", fn_lower, re.IGNORECASE
    )
    if grade_match:
        grade = int(grade_match.group(1))
    else:
        digits = re.findall(r"\b(5|6|7|8|9|10|11)\b", fn_lower)
        if digits:
            grade = int(digits[0])

    subject = "math"
    if "matematika" in folder_lower or "математ" in fn_lower:
        subject = "math"
    elif "algebra" in folder_lower or "алгебр" in fn_lower:
        subject = "algebra" if grade >= 7 else "math"
    elif "geometriya" in folder_lower or "геометр" in fn_lower:
        subject = "geometry" if grade >= 7 else "math"
    elif "fizika" in folder_lower or "физик" in fn_lower:
        subject = "physics"
    elif "himiya" in folder_lower or "хим" in fn_lower:
        subject = "chemistry"
    elif "informatika" in folder_lower or "инфор" in fn_lower:
        subject = "cs"
    elif "russian" in folder_lower or "русск" in fn_lower:
        subject = "russian"

    author = "Просвещение"
    known_authors = [
        "Виленкин", "Атанасян", "Мерзляк", "Макарычев", "Мордкович", "Пёрышкин",
        "Первышкин", "Перышкин", "Габриелян", "Ладыженская", "Баранов", "Тростенцова",
        "Босова", "Поляков", "Мякишев", "Алимов", "Погорелов", "Рудзитис", "Петерсон", "Бунимович"
    ]
    for a in known_authors:
        if a.lower() in fn_lower:
            author = a
            break

    return subject, grade, author


async def process_pdf_folder():
    print("=" * 70)
    print("🚀 ОЦИФРОВКА НАСТОЯЩИХ PDF (С АВТО-УДАЛЕНИЕМ БИТЫХ HTML-ФАЙЛОВ)")
    print(f"Папка источника: {PDF_DATABASE_DIR}")
    print("=" * 70)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if not os.path.exists(PDF_DATABASE_DIR):
        print("⚠️ Папка 'database_pdf_materials' не найдена!")
        return

    async with AsyncSessionLocal() as db:
        pdf_files = []
        for root, _, files in os.walk(PDF_DATABASE_DIR):
            for file in files:
                if file.lower().endswith(".pdf"):
                    pdf_files.append(os.path.join(root, file))

        print(f"📚 Найдено {len(pdf_files)} PDF-файлов на проверку...\n")

        total_parsed_exercises = 0

        for idx, pdf_path in enumerate(pdf_files, start=1):
            filename = os.path.basename(pdf_path)
            fn_lower = filename.lower()
            folder_name = os.path.basename(os.path.dirname(pdf_path))

            # 1. ПРОВЕРКА НАСТОЯЩЕГО PDF: Удаляем битые HTML-файлы от старых запусков
            try:
                with open(pdf_path, "rb") as check_f:
                    if check_f.read(4) != b"%PDF":
                        print(f"[{idx}/{len(pdf_files)}] 🧹 Удаление битого HTML-файла: {filename[:40]}...")
                        check_f.close()
                        os.remove(pdf_path)
                        continue
            except Exception:
                continue

            # 2. ФИЛЬТР: Пропускаем методички для учителей
            if any(tg in fn_lower for tg in TEACHER_GUIDE_KEYWORDS):
                print(f"[{idx}/{len(pdf_files)}] ⏭️ Пропуск (Методичка): {filename[:40]}...")
                continue

            # 3. ФИЛЬТР: Пропускаем чужие предметы (История, Литература)
            if any(bad in fn_lower for bad in FORBIDDEN_EXAM_SUBJECTS):
                print(f"[{idx}/{len(pdf_files)}] ⏭️ Пропуск (Чужой предмет): {filename[:40]}...")
                continue

            subject, grade, author = detect_metadata_from_filename(filename, folder_name)
            clean_title = filename.replace(".pdf", "").replace("_", " ")

            print(f"[{idx}/{len(pdf_files)}] Оцифровка [{subject.upper()} / {grade} кл]: {filename[:40]}...")

            try:
                with open(pdf_path, "rb") as f:
                    file_bytes = f.read()

                exercises = pdf_ingestion_service.parse_pdf_textbook(
                    file_bytes, author, grade, subject
                )

                if not exercises:
                    print(f"  └─► В файле не найдено упражнений.")
                    continue

                if folder_name in ("ege", "oge"):
                    exam_type = folder_name.upper()
                    for ex in exercises:
                        task = RAGTask(
                            id=uuid.uuid4(),
                            subject=subject,
                            task_number=ex["exercise_number"],
                            condition_text=ex["condition_text"],
                            solution_text=f"Сборник {clean_title}",
                            source=f"{author}_{exam_type}",
                        )
                        db.add(task)
                    await db.commit()
                    total_parsed_exercises += len(exercises)
                    print(f"  └─► ✅ Добавлено {len(exercises)} задач в Банк [{exam_type}]!")

                else:
                    textbook = Textbook(
                        subject=subject,
                        grade=grade,
                        author=author,
                        title=clean_title,
                        publication_year=2024,
                    )
                    db.add(textbook)
                    await db.commit()
                    await db.refresh(textbook)

                    for ex in exercises:
                        db_ex = TextbookExercise(
                            textbook_id=textbook.id,
                            exercise_number=ex["exercise_number"],
                            chapter_title=ex["chapter_title"],
                            condition_text=ex["condition_text"],
                        )
                        db.add(db_ex)

                    await db.commit()
                    total_parsed_exercises += len(exercises)
                    print(f"  └─► ✅ Успешно оцифровано {len(exercises)} упражнений в [{subject.upper()} / {grade} КЛАСС]!")

            except Exception as e:
                await db.rollback()
                print(f"  └─► ❌ Ошибка оцифровки {filename[:30]}: {e}")

        print("\n" + "=" * 70)
        print(f"🎉 ЧИСТАЯ ОЦИФРОВКА ЗАВЕРШЕНА!")
        print(f"Занесено {total_parsed_exercises} чистых упражнений в БД!")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(process_pdf_folder())
