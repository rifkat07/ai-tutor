#!/bin/bash
set -e

echo "============================================================"
echo "🚀 ЗАПУСК РАЗВЕРТЫВАНИЯ AI-TUTOR НА ОБЛАЧНОМ СЕРВЕРЕ"
echo "============================================================"

# 1. Загрузка обновлений из репозитория Git
echo "📥 [1/4] Подтягиваем свежий код из Git..."
git pull origin main || true

# 2. Сборка и запуск контейнеров
echo "🐳 [2/4] Запускаем Docker Compose..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 3. Наполнение базы данных и генерация векторов
echo "🌱 [3/4] Запускаем инициализацию базы данных..."
docker compose -f docker-compose.prod.yml exec -T backend python seed_fipi_bank.py || true
docker compose -f docker-compose.prod.yml exec -T backend python seed_all_fgos_textbooks.py || true
docker compose -f docker-compose.prod.yml exec -T backend python index_tasks_embeddings.py || true

# 4. Проверка статуса
echo "✅ [4/4] Проверка работоспособности..."
docker compose -f docker-compose.prod.yml ps

echo "============================================================"
echo "🎉 СЕРВЕР УСПЕШНО РАЗВЕРНУТ И ГОТОВ К РАБОТЕ!"
echo "============================================================"