@echo off
title Запуск AI-Tutor v2.0
color 0A

echo ============================================================
echo 🚀 ЗАПУСК ЭКОСИСТЕМЫ AI-TUTOR v2.0...
echo ============================================================
echo.

:: 1. Запуск Бэкенда (FastAPI) в отдельном фоновом окне
echo [1/3] Запускаем сервер Бэкенда (Python FastAPI)...
start "AI-Tutor Backend Engine" cmd /k "cd /d E:\ai-tutor-monorepo\apps\backend && py -m uvicorn app.main:app --reload"

:: 2. Запуск Фронтенда (Next.js) в отдельном фоновом окне
echo [2/3] Запускаем веб-интерфейс Фронтенда (Next.js)...
start "AI-Tutor Frontend App" cmd /k "cd /d E:\ai-tutor-monorepo\apps\frontend && npm run dev"

:: 3. Ожидание 3 секунды и автоматическое открытие браузера
echo [3/3] Открываем браузер...
timeout /t 4 >nul
start http://localhost:3000/tutor

echo.
echo ============================================================
echo ✅ ВСЕ СЕРВИСЫ УСПЕШНО ЗАПУЩЕНЫ!
echo Страница http://localhost:3000/tutor открыта в браузере.
echo ============================================================