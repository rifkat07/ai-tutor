@echo off
title Загрузчик Учебников AI-Tutor
py "E:\ai-tutor-monorepo\apps\backend\pdf_uploader_gui.py"
if %errorlevel% neq 0 pause