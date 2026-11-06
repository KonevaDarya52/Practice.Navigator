from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Practice.Navigator API", version="0.1.0")

# Разрешаем фронтенду в режиме разработки (localhost:5173) обращаться к API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health():
    """Проверка, что сервер запущен."""
    return {"status": "ok"}


# Собранный фронтенд (React). В Docker он копируется в папку static.
# Подключаем его последним, чтобы адреса /api и /docs обрабатывал FastAPI.
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
