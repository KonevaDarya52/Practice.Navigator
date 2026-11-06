from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки приложения. Значения берутся из переменных окружения (см. docker-compose.yml)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://practice:practice@localhost:5432/practice"

    # Секрет для подписи JWT. В docker-compose задаётся свой; на сервере — обязательно заменить
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # токен живёт сутки

    # Студенты регистрируются по почте вуза. Пустая строка — проверка отключена
    student_email_domain: str = "tyuiu.ru"


settings = Settings()
