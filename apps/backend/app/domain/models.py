import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    BIGINT,
    FLOAT,
    INTEGER,
    VARCHAR,
    DateTime,
    ForeignKey,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        VARCHAR(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    full_name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    target_score: Mapped[int] = mapped_column(INTEGER, default=80)
    role: Mapped[str] = mapped_column(VARCHAR(32), default="student")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    states: Mapped[List["UserCompetencyState"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Competency(Base):
    __tablename__ = "competencies"

    id: Mapped[str] = mapped_column(VARCHAR(64), primary_key=True)
    subject: Mapped[str] = mapped_column(
        VARCHAR(32), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fipi_code: Mapped[Optional[str]] = mapped_column(
        VARCHAR(32), nullable=True
    )
    difficulty_level: Mapped[float] = mapped_column(FLOAT, default=1.0)


class CompetencyEdge(Base):
    __tablename__ = "competency_edges"

    parent_id: Mapped[str] = mapped_column(
        VARCHAR(64),
        ForeignKey("competencies.id", ondelete="CASCADE"),
        primary_key=True,
    )
    child_id: Mapped[str] = mapped_column(
        VARCHAR(64),
        ForeignKey("competencies.id", ondelete="CASCADE"),
        primary_key=True,
    )
    weight: Mapped[float] = mapped_column(FLOAT, default=1.0)


class UserCompetencyState(Base):
    __tablename__ = "user_competency_states"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    competency_id: Mapped[str] = mapped_column(
        VARCHAR(64),
        ForeignKey("competencies.id", ondelete="CASCADE"),
        primary_key=True,
    )

    p_mastery: Mapped[float] = mapped_column(FLOAT, default=0.1)
    p_transit: Mapped[float] = mapped_column(FLOAT, default=0.15)
    p_guess: Mapped[float] = mapped_column(FLOAT, default=0.2)
    p_slip: Mapped[float] = mapped_column(FLOAT, default=0.1)

    total_attempts: Mapped[int] = mapped_column(INTEGER, default=0)
    successful_attempts: Mapped[int] = mapped_column(INTEGER, default=0)
    last_practiced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="states")


class AffectiveLog(Base):
    __tablename__ = "affective_logs"

    id: Mapped[int] = mapped_column(
        BIGINT, primary_key=True, autoincrement=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False
    )
    detected_emotion: Mapped[str] = mapped_column(VARCHAR(32), nullable=False)
    typing_speed_wpm: Mapped[int] = mapped_column(INTEGER, default=0)
    pause_latency_ms: Mapped[int] = mapped_column(INTEGER, default=0)
    action_taken: Mapped[str] = mapped_column(VARCHAR(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class PvPMatch(Base):
    __tablename__ = "pvp_matches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    player1_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    player2_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    competency_id: Mapped[str] = mapped_column(
        VARCHAR(64), ForeignKey("competencies.id")
    )
    winner_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    player1_score: Mapped[int] = mapped_column(INTEGER, default=0)
    player2_score: Mapped[int] = mapped_column(INTEGER, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class RAGTask(Base):
    __tablename__ = "rag_tasks_bank"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    subject: Mapped[str] = mapped_column(VARCHAR(32), nullable=False, index=True)
    task_number: Mapped[str] = mapped_column(VARCHAR(32), nullable=False)
    fipi_code: Mapped[Optional[str]] = mapped_column(VARCHAR(32), nullable=True)
    condition_text: Mapped[str] = mapped_column(Text, nullable=False)
    solution_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(VARCHAR(64), default="FIPI")
    is_deprecated: Mapped[bool] = mapped_column(default=False)
    
    embedding = mapped_column(Vector(1536), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Textbook(Base):
    __tablename__ = "textbooks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    subject: Mapped[str] = mapped_column(VARCHAR(32), nullable=False, index=True)
    grade: Mapped[int] = mapped_column(INTEGER, nullable=False, index=True)
    author: Mapped[str] = mapped_column(VARCHAR(128), nullable=False)
    title: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    part: Mapped[Optional[int]] = mapped_column(INTEGER, default=1)
    publication_year: Mapped[int] = mapped_column(INTEGER, default=2023)

    exercises: Mapped[List["TextbookExercise"]] = relationship(
        back_populates="textbook", cascade="all, delete-orphan"
    )


class TextbookExercise(Base):
    __tablename__ = "textbook_exercises"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    textbook_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("textbooks.id", ondelete="CASCADE"), index=True
    )
    exercise_number: Mapped[str] = mapped_column(VARCHAR(32), nullable=False, index=True)
    chapter_title: Mapped[Optional[str]] = mapped_column(VARCHAR(255), nullable=True)
    condition_text: Mapped[str] = mapped_column(Text, nullable=False)
    official_solution_hint: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    textbook: Mapped["Textbook"] = relationship(back_populates="exercises")


# 📥 ТАБЛИЦА ГОТОВЫХ ОЦИФРОВАННЫХ ВАРИАНТОВ СДАМГИА / РЕШУЕГЭ
class SdamgiaVariant(Base):
    __tablename__ = "sdamgia_variants"

    id: Mapped[str] = mapped_column(VARCHAR(64), primary_key=True) # например: "5421822", "3120803"
    subject: Mapped[str] = mapped_column(VARCHAR(32), nullable=False, index=True) # math, physics, cs, russian
    exam_type: Mapped[str] = mapped_column(VARCHAR(16), nullable=False, index=True) # EGE, OGE
    variant_number: Mapped[str] = mapped_column(VARCHAR(32), nullable=False) # №1, №2, Вариант 5421822
    title: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    url: Mapped[str] = mapped_column(VARCHAR(500), nullable=False)
    tasks_count: Mapped[int] = mapped_column(INTEGER, default=0)
    tasks_data: Mapped[str] = mapped_column(Text, nullable=False) # JSON-строка со всеми реальными задачами
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
