import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.domain.models import RAGTask

router = APIRouter()


@router.get("/")
async def list_bank_tasks(
    subject: str = Query("math"),
    exam_type: str = Query("EGE"),
    db: AsyncSession = Depends(get_db),
):
    """Получение всех оцифрованных КИМов с объединением дисциплин (Математика/Алгебра/Геометрия)."""
    
    # Объединяем математические дисциплины, чтобы Алгебра и Геометрия не были пустыми
    target_subjects = [subject]
    if subject in ("math", "algebra", "geometry"):
        target_subjects = ["math", "algebra", "geometry"]

    stmt = select(RAGTask).where(RAGTask.subject.in_(target_subjects))
    res = await db.execute(stmt)
    tasks = res.scalars().all()

    filtered = []
    for t in tasks:
        source_lower = (t.source or "").lower()
        num_lower = (t.task_number or "").lower()

        if exam_type.lower() == "oge" and (
            "oge" in source_lower
            or "огэ" in num_lower
            or "20" in num_lower
            or "21" in num_lower
            or "22" in num_lower
            or "23" in num_lower
            or "15" in num_lower
        ):
            filtered.append(t)
        elif exam_type.lower() == "ege" and (
            "oge" not in source_lower and "огэ" not in num_lower
        ):
            filtered.append(t)

    target_list = filtered if filtered else tasks

    return [
        {
            "id": str(t.id),
            "taskNumber": t.task_number or "№13",
            "title": t.fipi_code or "Задание КИМ ФИПИ",
            "subject": t.subject,
            "condition": t.condition_text,
            "solution": t.solution_text,
        }
        for t in target_list
    ]
