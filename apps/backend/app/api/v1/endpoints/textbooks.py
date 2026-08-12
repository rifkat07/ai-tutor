import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.domain.models import RAGTask, Textbook, TextbookExercise
from app.services.pdf_ingestion import pdf_ingestion_service
from app.services.textbook_service import textbook_service

router = APIRouter()


@router.get("/")
async def list_textbooks(
    grade: int = Query(None, ge=5, le=11),
    subject: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Получение списка учебников с фильтрацией по классу (5-11) и предмету."""
    return await textbook_service.get_textbooks(
        db, grade=grade, subject=subject
    )


@router.get("/{textbook_id}/exercises")
async def get_textbook_exercises(
    textbook_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Получение всех оцифрованных упражнений из конкретного учебника."""
    try:
        tb_uuid = uuid.UUID(textbook_id)
        stmt = select(TextbookExercise).where(TextbookExercise.textbook_id == tb_uuid)
        res = await db.execute(stmt)
        exercises = res.scalars().all()
        return [
            {
                "id": str(ex.id),
                "exercise_number": ex.exercise_number,
                "chapter_title": ex.chapter_title,
                "condition_text": ex.condition_text,
                "official_solution_hint": ex.official_solution_hint,
            }
            for ex in exercises
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search")
async def search_exercise(
    author: str,
    grade: int,
    exercise_number: str,
    db: AsyncSession = Depends(get_db),
):
    ex = await textbook_service.find_exercise(
        db, author, grade, exercise_number
    )
    if not ex:
        raise HTTPException(
            status_code=404,
            detail=f"Упражнение {exercise_number} не найдено",
        )
    return ex


@router.post("/upload-pdf")
async def upload_textbook_pdf(
    author: str = Form(...),
    grade: int = Form(...),
    subject: str = Form(...),
    material_type: str = Form("EGE"),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Формат должен быть PDF")

    file_bytes = await file.read()
    exercises = pdf_ingestion_service.parse_pdf_textbook(
        file_bytes, author, grade, subject
    )

    if material_type in ("EGE", "OGE"):
        for ex in exercises:
            task = RAGTask(
                id=uuid.uuid4(),
                subject=subject,
                task_number=ex["exercise_number"],
                condition_text=ex["condition_text"],
                solution_text=f"Сборник {title}",
                source=f"{author}_{material_type}",
            )
            db.add(task)
        await db.commit()

        return {
            "status": "success",
            "material_type": material_type,
            "parsed_exercises_count": len(exercises),
            "message": f"Сборник {material_type} '{title}' ({author}) успешно загружен!",
        }

    else:
        textbook = Textbook(
            subject=subject, grade=grade, author=author, title=title
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

        return {
            "status": "success",
            "material_type": "SCHOOL",
            "parsed_exercises_count": len(exercises),
            "message": f"Школьный учебник '{title}' ({author}, {grade} кл) оцифрован!",
        }
