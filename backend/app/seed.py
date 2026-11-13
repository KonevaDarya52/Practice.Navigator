"""Тестовые данные для разработки и демо.

Запускается при старте контейнера (см. start.sh) и ничего не делает, если в БД уже есть пользователи.
Запустить вручную: docker compose exec app python -m app.seed

Демо-аккаунты (пароль у всех — demo12345):
  студент      student.l@demo.ru
  компания     hr@technoplus.ru      — ООО «ТехноПлюс», проверена вузом
  компания     it@tnpz.ru            — АО «Тюменский НПЗ», проверена вузом
  компания     hr@sibsoft.ru         — ООО «СибСофт», ждёт проверки
  модератор    moderator@tyuiu.ru    — сотрудник вуза
"""

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.modules.auth.models import ROLE_COMPANY, ROLE_MODERATOR, ROLE_STUDENT, User
from app.modules.dictionaries.models import Direction, Skill
from app.modules.organizations.models import ORG_APPROVED, ORG_PENDING, Organization
from app.modules.profiles.models import StudentProfile
from app.modules.requests.models import REQ_DRAFT, REQ_PENDING, REQ_PUBLISHED, PracticeRequest

DEMO_PASSWORD = "demo12345"

DIRECTIONS = [
    ("27.03.04", "Автоматизация и телемеханика"),
    ("09.03.01", "Информатика и вычислительная техника"),
    ("09.03.02", "Информационные системы и технологии"),
    ("09.03.03", "Прикладная информатика"),
    ("09.03.04", "Программная инженерия"),
    ("15.03.04", "Автоматизация технологических процессов и производств"),
    ("21.03.01", "Нефтегазовое дело"),
]

SKILLS = {
    "Программирование": ["Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "Go", "1С"],
    "Веб": ["React", "HTML/CSS", "FastAPI", "Django", "Node.js"],
    "Данные": ["SQL / PostgreSQL", "Pandas", "Power BI", "Excel", "Машинное обучение"],
    "Инструменты": ["Git", "Docker", "Linux", "Figma"],
    "Автоматизация": ["SCADA", "ПЛК", "AutoCAD"],
}


def seed_dictionaries(db: Session) -> None:
    if db.scalar(select(Direction).limit(1)) is None:
        db.add_all(Direction(code=code, name=name) for code, name in DIRECTIONS)
    if db.scalar(select(Skill).limit(1)) is None:
        db.add_all(Skill(name=name, category=category) for category, names in SKILLS.items() for name in names)


def user(email: str, role: str, full_name: str) -> User:
    return User(email=email, role=role, full_name=full_name, password_hash=hash_password(DEMO_PASSWORD))


def seed_users(db: Session) -> None:
    # ----- Студент с заполненной анкетой (те же данные, что были во фронтенде) -----
    student = user("student.l@demo.ru", ROLE_STUDENT, "Конева Дарья Александровна")
    db.add(student)
    db.flush()
    db.add(
        StudentProfile(
            user_id=student.id,
            status="Студентка ТИУ",
            open_to_offers=True,
            birth_date=date(2005, 9, 27),
            phone="+7 999 123-45-67",
            city="Тюмень",
            university="Тюменский индустриальный университет",
            faculty="ИТиС",
            direction="Автоматизация и телемеханика",
            course=4,
            group="АТК-1-23",
            education_level="Бакалавриат",
            education_form="Очная",
            education_period="2023 — 2027",
            gpa="4,6",
            practice_type="Производственная",
            format="Гибрид",
            preferred_city="Тюмень",
            payment="Оплачиваемая",
            github="github.com/dkoneva",
            technical_skills=[
                {"name": "Python", "level": 4},
                {"name": "SQL / PostgreSQL", "level": 3},
                {"name": "React", "level": 3},
                {"name": "Git", "level": 3},
                {"name": "Docker", "level": 2},
                {"name": "Linux", "level": 2},
            ],
            programming_languages=[
                {"name": "Python", "level": "Продвинутый"},
                {"name": "TypeScript", "level": "Уверенный"},
                {"name": "SQL", "level": "Уверенный"},
                {"name": "C++", "level": "Базовый"},
            ],
            foreign_languages=[{"name": "Английский", "level": "B2"}, {"name": "Немецкий", "level": "A2"}],
            interests=["Веб-разработка", "Анализ данных", "Автоматизация", "UX/UI"],
            experience=[
                {"title": "Учебная практика", "place": "ООО «ТехноПлюс»", "period": "Июль 2025 · 4 недели"},
                {"title": "Организатор хакатона", "place": "Студенческий совет ИТиС", "period": "2024 — 2026"},
            ],
            achievements=[
                {"kind": "certificate", "title": "Python для анализа данных", "details": "Stepik", "year": "2025", "link": None},
                {"kind": "certificate", "title": "Основы SQL", "details": "Яндекс Практикум", "year": "2025", "link": None},
                {"kind": "course", "title": "Веб-разработка на React", "details": "Coursera · 40 часов", "year": "2026", "link": None},
                {"kind": "project", "title": "Practice.Navigator", "details": "Сервис подбора практики · React, FastAPI",
                 "year": "2026", "link": "github.com/KonevaDarya52/Practice.Navigator"},
                {"kind": "project", "title": "Бот расписания ТИУ", "details": "Telegram-бот · Python, aiogram", "year": "2025", "link": None},
                {"kind": "conference", "title": "«Новые технологии — нефтегазовому региону»",
                 "details": "Международная · докладчик · «Автоматизация учёта на производстве»", "year": "2026", "link": None},
            ],
        )
    )

    # ----- Вуз -----
    db.add(user("moderator@tyuiu.ru", ROLE_MODERATOR, "Петрова Анна Сергеевна"))

    # ----- Компании -----
    def company(email: str, contact: str, name: str, inn: str, status: str) -> Organization:
        owner = user(email, ROLE_COMPANY, contact)
        db.add(owner)
        db.flush()
        org = Organization(name=name, inn=inn, status=status, owner_id=owner.id, contact_phone="+7 3452 00-00-00")
        db.add(org)
        db.flush()
        return org

    technoplus = company("hr@technoplus.ru", "Смирнов Олег Игоревич", "ООО «ТехноПлюс»", "7203000001", ORG_APPROVED)
    tnpz = company("it@tnpz.ru", "Ковалёва Ирина Викторовна", "АО «Тюменский НПЗ»", "7204000002", ORG_APPROVED)
    company("hr@sibsoft.ru", "Захаров Денис Андреевич", "ООО «СибСофт»", "7205000003", ORG_PENDING)

    # ----- Заявки -----
    db.add_all([
        PracticeRequest(
            organization_id=technoplus.id,
            status=REQ_PUBLISHED,
            title="Стажёр-разработчик Python",
            description="Участие в разработке внутренних инструментов компании под руководством наставника.",
            directions=["Автоматизация и телемеханика", "Программная инженерия"],
            courses=[3, 4],
            places=3,
            date_from=date(2027, 2, 1),
            date_to=date(2027, 4, 30),
            deadline=date(2027, 1, 15),
            format="Гибрид",
            city="Тюмень",
            paid=True,
            tasks=["Доработка внутренних сервисов на FastAPI", "Написание тестов", "Код-ревью с наставником"],
            required_skills=["Python", "Git", "SQL / PostgreSQL"],
            desired_skills=["Docker", "FastAPI"],
            mentor="Смирнов Олег Игоревич, тимлид",
        ),
        PracticeRequest(
            organization_id=tnpz.id,
            status=REQ_PUBLISHED,
            title="Практикант отдела автоматизации",
            description="Знакомство с задачами цифровизации производственных процессов.",
            directions=["Автоматизация и телемеханика", "Автоматизация технологических процессов и производств"],
            courses=[2, 3, 4],
            places=3,
            date_from=date(2027, 2, 10),
            date_to=date(2027, 4, 10),
            deadline=date(2027, 1, 25),
            format="Офис",
            city="Тюмень",
            paid=False,
            tasks=["Сбор данных с датчиков", "Отчёты в Excel и Power BI"],
            required_skills=["Excel", "SCADA", "Python"],
            desired_skills=["Power BI"],
            mentor="Ковалёва Ирина Викторовна",
        ),
        PracticeRequest(
            organization_id=technoplus.id,
            status=REQ_PENDING,
            title="Аналитик данных (стажёр)",
            description="Подготовка отчётов и дашбордов для отдела продаж.",
            directions=["Прикладная информатика", "Информационные системы и технологии"],
            courses=[3, 4],
            places=2,
            date_from=date(2027, 3, 1),
            date_to=date(2027, 5, 31),
            deadline=date(2027, 2, 15),
            format="Удалённо",
            city="Тюмень",
            paid=True,
            tasks=["Сбор и очистка данных", "Дашборды в Power BI"],
            required_skills=["SQL / PostgreSQL", "Excel"],
            desired_skills=["Pandas", "Power BI"],
        ),
        PracticeRequest(
            organization_id=tnpz.id,
            status=REQ_DRAFT,
            title="Инженер-программист АСУ ТП",
            description="Черновик: компания ещё заполняет заявку.",
            places=1,
            format="Офис",
            city="Тюмень",
        ),
    ])


def main() -> None:
    with SessionLocal() as db:
        seed_dictionaries(db)
        if db.scalar(select(User).limit(1)) is None:
            seed_users(db)
            print("Тестовые данные добавлены")
        else:
            print("В БД уже есть пользователи — тестовые данные не добавляю")
        db.commit()


if __name__ == "__main__":
    main()
