# ---------- Шаг 1: собираем фронтенд (React + TypeScript) ----------
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Шаг 2: backend на FastAPI, который отдаёт и API, и сайт ----------
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/alembic.ini backend/start.sh ./
COPY backend/migrations ./migrations
COPY backend/app ./app
# Готовый фронтенд кладём в папку static
COPY --from=frontend /frontend/dist ./static

# Убираем переводы строк Windows, если файл сохранили на Windows
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

EXPOSE 8000
CMD ["./start.sh"]
