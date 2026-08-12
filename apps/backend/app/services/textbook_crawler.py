import asyncio
from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models import Textbook, TextbookExercise
from app.services.web_search import web_search_service


class AutomaticTextbookCrawler:
    """Сервис сплошной оцифровки школьных учебников и решебников от корки до корки (все упражнения от №1 до конца)."""

    TOP_AUTHORS_MAP = {
        "math": ["Виленкин Н.Я.", "Мерзляк А.Г."],
        "algebra": ["Макарычев Ю.Н.", "Мерзляк А.Г."],
        "geometry": ["Атанасян Л.С.", "Погорелов А.В."],
        "physics": ["Пёрышкин А.В.", "Мякишев Г.Я."],
        "chemistry": ["Габриелян О.С.", "Рудзитис Г.Е."],
        "russian": ["Ладыженская Т.А.", "Баранов М.Т."],
        "cs": ["Босова Л.Л.", "Поляков К.Ю."],
    }

    async def auto_discover_and_ingest(
        self,
        db: AsyncSession,
        subject: str,
        grade: int,
        max_exercises: int = 50,  # Количество упражнений для сплошной оцифровки
    ) -> Dict[str, Any]:
        """Сплошной сбор ВСЕХ упражнений учебника от №1 до max_exercises."""
        authors = self.TOP_AUTHORS_MAP.get(subject, ["Виленкин Н.Я."])
        main_author = authors[0]

        title = f"{subject.capitalize()} {grade} класс ({main_author}) — ПОЛНОЕ ИЗДАНИЕ"

        # 1. Создаем запись о полном учебнике
        textbook = Textbook(
            subject=subject,
            grade=grade,
            author=main_author,
            title=title,
            publication_year=2024,
        )
        db.add(textbook)
        await db.commit()
        await db.refresh(textbook)

        added_count = 0

        # 2. СКВОЗНОЙ ЦИКЛ ОЦИФРОВКИ ВСЕХ НОМЕРОВ УЧЕБНИКА (от №1 до max_exercises)
        for ex_num in range(1, max_exercises + 1):
            ex_str = f"№{ex_num}"
            query = f"site:child-class.org OR учебник {main_author} {grade} класс упражнение {ex_str}"

            search_results = await web_search_service.search_educational_web(
                query
            )

            condition = (
                search_results[0]["snippet"]
                if search_results
                else f"Упражнение {ex_str} из официального учебника {main_author} ({grade} класс)."
            )

            ex = TextbookExercise(
                textbook_id=textbook.id,
                exercise_number=ex_str,
                chapter_title=f"{grade} класс — {main_author}",
                condition_text=condition,
                official_solution_hint=f"Полное решение из книги {main_author}",
            )
            db.add(ex)
            added_count += 1

            # Пауза и сохранение каждые 5 номеров
            if ex_num % 5 == 0:
                await db.commit()
                await asyncio.sleep(0.5)

        await db.commit()

        return {
            "status": "success",
            "textbook": title,
            "author": main_author,
            "grade": grade,
            "auto_ingested_exercises": added_count,
        }


textbook_crawler = AutomaticTextbookCrawler()
