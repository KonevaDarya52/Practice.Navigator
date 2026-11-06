#!/bin/sh
# Запуск backend в контейнере:
# 1) применяем миграции, 2) заполняем БД тестовыми данными (только если она пустая), 3) стартуем сервер
set -e

alembic upgrade head
python -m app.seed
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
