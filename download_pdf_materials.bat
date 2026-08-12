@echo off
chcp 65001 >nul
title Загрузчик PDF с so.11klasov.net
color 0A

echo ============================================================
echo 🚀 СКАЧИВАНИЕ ВСЕХ УЧЕБНИКОВ, СБОРНИКОВ ЕГЭ И ОГЭ
echo Источник: so.11klasov.net
echo ============================================================
echo.

cd /d E:\ai-tutor-monorepo\apps\backend
py download_all_materials.py

echo.
echo ============================================================
echo ✅ Скачивание всех PDF завершено!
echo Все книги лежат в папке: E:\ai-tutor-monorepo\database_pdf_materials
echo ============================================================
echo.
pause