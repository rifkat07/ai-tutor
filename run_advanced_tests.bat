@echo off
chcp 65001 >nul
title Расширенное Тестирование Математического Ядра (Advanced Verifier)
color 0A

echo ============================================================
echo 🧪 ЗАПУСК РАСШИРЕННЫХ ТЕСТОВ ADVANCED MATH VERIFIER
echo Файл: apps/backend/tests/test_advanced_verifier.py
echo ============================================================
echo.

cd /d E:\ai-tutor-monorepo\apps\backend
py -m pytest tests/test_advanced_verifier.py -v

echo.
echo ============================================================
echo ✅ Тестирование завершено!
echo ============================================================
echo.
pause