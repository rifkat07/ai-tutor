import json
import subprocess
import sys
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.domain.models import RAGTask, SdamgiaVariant
from app.services.embedding_service import embedding_service
from app.services.sdamgia_service import sdamgia_service
import numpy as np

router = APIRouter()


class SemanticSearchRequest(BaseModel):
    query: str
    subject: str = "math"
    exam_type: str = "EGE"
    limit: int = 15


class SdamgiaImportRequest(BaseModel):
    variant_id: str
    subject: str = "math"
    exam_type: str = "EGE"


class PythonRunRequest(BaseModel):
    code: str


@router.get("/")
async def list_bank_tasks(
    subject: str = Query("math"),
    exam_type: str = Query("EGE"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Получение оцифрованных КИМов со СТРОГОЙ изоляцией ОГЭ и ЕГЭ и пагинацией."""
    target_subjects = [subject]
    if subject in ("math", "algebra", "geometry"):
        target_subjects = ["math", "algebra", "geometry"]

    stmt = select(RAGTask).where(RAGTask.subject.in_(target_subjects))
    res = await db.execute(stmt)
    tasks = res.scalars().all()

    filtered = []
    is_target_oge = exam_type.upper() == "OGE"

    for t in tasks:
        source_lower = (t.source or "").lower()
        num_lower = (t.task_number or "").lower()
        code_lower = (t.fipi_code or "").lower()
        full_meta = f"{source_lower} {num_lower} {code_lower}"

        is_task_oge = (
            "oge" in source_lower
            or "огэ" in num_lower
            or "огэ" in code_lower
            or "oge" in code_lower
        )

        if is_target_oge and is_task_oge:
            filtered.append(t)
        elif not is_target_oge and not is_task_oge:
            filtered.append(t)

    target_list = filtered if filtered else (tasks if not is_target_oge else [])

    # Постраничная пагинация
    total_count = len(target_list)
    start_idx = (page - 1) * limit
    paginated_items = target_list[start_idx : start_idx + limit]
    has_more = total_count > (start_idx + limit)

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "has_more": has_more,
        "tasks": [
            {
                "id": str(t.id),
                "taskNumber": t.task_number or "№1",
                "title": t.fipi_code or "Задание КИМ ФИПИ",
                "subject": t.subject,
                "condition": t.condition_text,
                "solution": t.solution_text,
                "similarity": None,
            }
            for t in paginated_items
        ],
    }


@router.get("/sdamgia-catalog")
async def get_sdamgia_catalog_endpoint(
    subject: str = Query("math"),
    exam_type: str = Query("EGE"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    norm_exam = "OGE" if exam_type.upper() == "OGE" else "EGE"
    return await sdamgia_service.get_cached_catalog(
        db=db,
        subject=subject,
        exam_type=norm_exam,
        page=page,
        limit=limit,
    )


@router.post("/semantic-search")
async def semantic_search_tasks(
    data: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
):
    query_text = data.query.strip()
    if not query_text:
        return await list_bank_tasks(
            subject=data.subject, exam_type=data.exam_type, db=db
        )

    query_vec = np.array(
        embedding_service.generate_embedding(query_text), dtype=np.float32
    )

    target_subjects = [data.subject]
    if data.subject in ("math", "algebra", "geometry"):
        target_subjects = ["math", "algebra", "geometry"]

    stmt = select(RAGTask).where(RAGTask.subject.in_(target_subjects))
    res = await db.execute(stmt)
    all_tasks = res.scalars().all()

    is_target_oge = data.exam_type.upper() == "OGE"
    scoped_tasks = []

    for t in all_tasks:
        full_meta = f"{(t.source or '')} {(t.task_number or '')} {(t.fipi_code or '')}".lower()
        is_task_oge = "oge" in full_meta or "огэ" in full_meta

        if is_target_oge and is_task_oge:
            scoped_tasks.append(t)
        elif not is_target_oge and not is_task_oge:
            scoped_tasks.append(t)

    if not scoped_tasks:
        scoped_tasks = all_tasks

    scored_tasks = []
    for t in scoped_tasks:
        if t.embedding is not None and len(t.embedding) == 1536:
            task_vec = np.array(t.embedding, dtype=np.float32)
        else:
            task_vec = np.array(
                embedding_service.generate_embedding(
                    f"{t.task_number} {t.condition_text}"
                ),
                dtype=np.float32,
            )

        similarity = float(np.dot(query_vec, task_vec))
        if any(
            w in t.condition_text.lower()
            for w in query_text.lower().split()
            if len(w) > 3
        ):
            similarity += 0.25

        scored_tasks.append((similarity, t))

    scored_tasks.sort(key=lambda x: x[0], reverse=True)
    top_matches = scored_tasks[: data.limit]

    return [
        {
            "id": str(t.id),
            "taskNumber": t.task_number or "№1",
            "title": t.fipi_code or "Задание КИМ ФИПИ",
            "subject": t.subject,
            "condition": t.condition_text,
            "solution": t.solution_text,
            "similarity": min(99, max(45, round(score * 100))),
        }
        for score, t in top_matches
    ]


@router.post("/import-sdamgia")
async def import_sdamgia_variant_endpoint(
    data: SdamgiaImportRequest,
    db: AsyncSession = Depends(get_db),
):
    clean_id = str(data.variant_id).strip()
    norm_exam = "OGE" if data.exam_type.upper() == "OGE" else "EGE"

    stmt = select(SdamgiaVariant).where(
        SdamgiaVariant.id == clean_id,
        SdamgiaVariant.subject == data.subject,
        SdamgiaVariant.exam_type == norm_exam,
    )
    res = await db.execute(stmt)
    cached = res.scalar_one_or_none()

    if cached and cached.tasks_data:
        tasks = json.loads(cached.tasks_data)
        return {
            "variant_id": cached.id,
            "subject": cached.subject,
            "exam_type": cached.exam_type,
            "title": cached.title,
            "source_url": cached.url,
            "tasks_count": len(tasks),
            "tasks": tasks,
        }

    result = await sdamgia_service.fetch_variant_online(
        variant_id=clean_id,
        subject=data.subject,
        exam_type=norm_exam,
    )

    if result["tasks"]:
        db_variant = SdamgiaVariant(
            id=clean_id,
            subject=data.subject,
            exam_type=norm_exam,
            variant_number=f"№{clean_id}",
            title=result["title"],
            url=result["source_url"],
            tasks_count=len(result["tasks"]),
            tasks_data=json.dumps(result["tasks"], ensure_ascii=False),
        )
        db.add(db_variant)
        await db.commit()

    return result


@router.post("/run-python")
async def run_python_code_endpoint(data: PythonRunRequest):
    code_text = data.code.strip()
    if not code_text:
        return {"output": "", "error": None}

    forbidden = ["rm -rf", "shutil.rmtree", "os.system('rm", "format c:"]
    for token in forbidden:
        if token in code_text.lower():
            return {"output": "", "error": "Команда заблокирована политикой безопасности."}

    try:
        process = subprocess.run(
            [sys.executable, "-c", code_text],
            capture_output=True,
            text=True,
            timeout=5.0,
        )
        output = process.stdout
        if process.stderr:
            output = f"{output}\n{process.stderr}" if output else process.stderr
        return {"output": output.strip(), "error": None}
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Таймаут выполнения (более 5 секунд). Проверьте бесконечные циклы!"}
    except Exception as e:
        return {"output": "", "error": f"Ошибка выполнения среды: {str(e)}"}
