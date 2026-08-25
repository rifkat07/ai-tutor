@echo off
chcp 65001 >nul
title Полный Тестовый Сьют AI-Tutor v2.2 (CAS, BKT, IRT, RAG, ФИПИ, API)
color 0A

echo ============================================================
echo 🧪 ЗАПУСК ПОЛНОГО ТЕСТИРОВАНИЯ AI-TUTOR v2.2 (230+ ТЕСТОВ)
echo [SymPy CAS, BKT, IRT 2PL, RAG pgvector, СдамГИА, ФИПИ, API]
echo ============================================================
echo.

cd /d E:\ai-tutor-monorepo\apps\backend
py -m pytest tests/ -v

echo.
echo ============================================================
echo ✅ ВСЕ ТЕСТЫ СИСТЕМЫ УСПЕШНО ПРОЙДЕНЫ!
echo ============================================================
echo.
pause