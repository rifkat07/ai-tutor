from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    competencies,
    diagnostic,
    chat_ws,
    textbooks,
    tasks,  # Добавлен импорт tasks!
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(
    competencies.router, prefix="/competencies", tags=["Competencies"]
)
api_router.include_router(
    diagnostic.router, prefix="/diagnostic", tags=["Diagnostic"]
)
api_router.include_router(chat_ws.router, prefix="/chat", tags=["Socratic WS"])
api_router.include_router(
    textbooks.router, prefix="/textbooks", tags=["Textbooks 5-11"]
)
api_router.include_router(
    tasks.router, prefix="/tasks", tags=["Tasks Bank"]  # Подключен роутер банка задач!
)
