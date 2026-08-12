import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.db import engine, Base
from app.api.v1.router import api_router
from app.services.sync_worker import sync_worker

# Обязательный импорт моделей для регистрации таблиц
import app.domain.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 AI-Tutor v2.0 Engine Successfully Loaded and Online!")
    
    # Авто-создание всех таблиц при запуске сервера
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Все таблицы базы данных синхронизированы!")

    asyncio.create_task(sync_worker.start_periodic_sync(interval_hours=12))
    yield
    print("🛑 Shutting down AI-Tutor Engine...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="Socratic Pedagogical AI Engine powered by DeepSeek API & SymPy",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": settings.PROJECT_NAME,
        "internet_sync": "active",
    }
