from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.domain.models import Competency
from app.services.theory_service import dynamic_theory_service
from app.services.task_generator import task_generator_service

router = APIRouter()


class TheoryRequestSchema(BaseModel):
    subject: str
    competency_title: str
    task_context: str


class SimilarTaskRequestSchema(BaseModel):
    subject: str
    grade: int
    exam_type: str
    task_context: str


@router.get("/")
async def get_competencies(
    subject: str = "math", db: AsyncSession = Depends(get_db)
):
    stmt = select(Competency).where(Competency.subject == subject)
    result = await db.execute(stmt)
    competencies = result.scalars().all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "fipi_code": c.fipi_code,
            "difficulty": c.difficulty_level,
        }
        for c in competencies
    ]


@router.post("/theory")
async def get_dynamic_task_theory(data: TheoryRequestSchema):
    return await dynamic_theory_service.generate_task_theory(
        subject=data.subject,
        task_context=data.task_context,
        competency_title=data.competency_title,
    )


@router.post("/generate-similar")
async def generate_similar_task_endpoint(data: SimilarTaskRequestSchema):
    """100% ИИ-генерация аналогичной задачи на основе текущей карточки."""
    generated_text = await task_generator_service.generate_similar_task(
        subject=data.subject,
        grade=data.grade,
        exam_type=data.exam_type,
        task_context=data.task_context,
    )
    return {"generated_task": generated_text}
