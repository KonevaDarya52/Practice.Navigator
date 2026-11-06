from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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


# ---------------------------------------------------------------------------
# Собранный фронтенд (React). В Docker он копируется в папку static.
# Подключаем его последним, чтобы адреса /api и /docs обрабатывал FastAPI.
# ---------------------------------------------------------------------------
STATIC_DIR = (Path(__file__).resolve().parent.parent / "static").resolve()

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def frontend(path: str):
        # Неизвестные адреса API — честная ошибка 404, а не страница сайта
        if path.startswith("api/"):
            raise HTTPException(status_code=404)

        # Если запрошен реальный файл (например, иконка) — отдаём его
        file = (STATIC_DIR / path).resolve()
        if path and file.is_file() and file.is_relative_to(STATIC_DIR):
            return FileResponse(file)

        # Все остальные адреса (/profile и т.д.) открывают React-приложение,
        # а нужную страницу уже показывает React Router
        return FileResponse(STATIC_DIR / "index.html")
