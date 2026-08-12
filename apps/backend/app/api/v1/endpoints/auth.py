from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.domain.models import User

router = APIRouter()


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=TokenSchema)
async def register(
    data: UserRegisterSchema, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Пользователь с таким email уже существует"
        )

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return TokenSchema(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "target_score": user.target_score,
        },
    )


@router.post("/login", response_model=TokenSchema)
async def login(data: UserLoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=401, detail="Неверный email или пароль"
        )

    token = create_access_token(data={"sub": str(user.id)})
    return TokenSchema(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "target_score": user.target_score,
        },
    )
