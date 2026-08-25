@echo off
chcp 65001 >nul
title Запуск AI-Tutor v2.2 (Full-Stack Ecosystem)
color 0A

echo ============================================================
echo 🚀 ЗАПУСК ЭКОСИСТЕМЫ AI-TUTOR v2.2...
echo ============================================================
echo.

:: 1. Запуск Бэкенда (FastAPI) в отдельном фоновом окне
echo [1/3] Запускаем сервер Бэкенда (Python FastAPI)...
start "AI-Tutor Backend Engine" cmd /k "cd /d E:\ai-tutor-monorepo\apps\backend && py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: 2. Запуск Фронтенда (Next.js) в отдельном фоновом окне
echo [2/3] Запускаем веб-интерфейс Фронтенда (Next.js)...
start "AI-Tutor Frontend App" cmd /k "cd /d E:\ai-tutor-monorepo\apps\frontend && npm run dev"

:: 3. Ожидание первичной компиляции модулей (7 секунд) и запуск браузера
echo [3/3] Ожидание компиляции и запуск браузера (7 сек)...
timeout /t 7 >nul
start http://localhost:3000/tutor

echo.
echo ============================================================
echo ✅ ВСЕ СЕРВИСЫ УСПЕШНО ЗАПУЩЕНЫ!
echo Страница http://localhost:3000/tutor открыта в браузере.
echo ============================================================