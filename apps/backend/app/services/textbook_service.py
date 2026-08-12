import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.models import Textbook, TextbookExercise


class TextbookService:
    """Сервис поиска упражнений из школьных учебников 5-11 классов."""

    async def get_textbooks(
        self, db: AsyncSession, grade: Optional[int] = None, subject: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        stmt = select(Textbook)
        if grade:
            stmt = stmt.where(Textbook.grade == grade)
        if subject:
            stmt = stmt.where(Textbook.subject == subject)

        res = await db.execute(stmt)
        books = res.scalars().all()
        return [
            {
                "id": str(b.id),
                "grade": b.grade,
                "subject": b.subject,
                "author": b.author,
                "title": b.title,
                "part": b.part,
            }
            for b in books
        ]

    async def find_exercise(
        self, db: AsyncSession, author: str, grade: int, exercise_number: str
    ) -> Optional[Dict[str, Any]]:
        """Поиск конкретного упражнения (например: Виленкин 5 класс №342)."""
        stmt = (
            select(TextbookExercise)
            .join(Textbook)
            .where(
                Textbook.author.ilike(f"%{author}%"),
                Textbook.grade == grade,
                TextbookExercise.exercise_number == exercise_number,
            )
        )
        res = await db.execute(stmt)
        ex = res.scalar_one_or_none()
        if not ex:
            return None

        return {
            "id": str(ex.id),
            "exercise_number": ex.exercise_number,
            "chapter_title": ex.chapter_title,
            "condition_text": ex.condition_text,
            "official_solution_hint": ex.official_solution_hint,
        }


textbook_service = TextbookService()
