// Данные профиля студента.
// Поля повторяют анкету студента из проекта (слайд «Анкета и заявка компании»).
// defaultProfile — тестовые данные, с которых начинается профиль.
// Пока нет backend, изменения хранятся в браузере (см. context/ProfileContext.tsx).

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type Skill = {
  name: string;
  level: SkillLevel;
};

export type Language = {
  name: string;
  level: string;
};

export type AchievementKind = "certificate" | "course" | "project" | "conference";

export type AchievementItem = {
  kind: AchievementKind;
  title: string;
  details: string;
  year: string;
  link?: string;
};

export type Experience = {
  title: string;
  place: string;
  period: string;
};

export type Badge = {
  icon: "star" | "briefcase" | "rocket";
  title: string;
};

export type ReadinessPart = {
  title: string;
  weight: number; // вес в балле совпадения, %
  filled: number; // насколько заполнено, %
};

export type ProfileData = {
  // Личные данные
  fullName: string;
  status: string;
  openToOffers: boolean;
  photo: string; // картинка в формате data URL, пустая строка — фото нет
  birthDate: string;
  email: string;
  phone: string;
  city: string;

  // Учёба
  university: string;
  faculty: string;
  direction: string;
  course: number;
  group: string;
  educationLevel: string;
  educationForm: string;
  educationPeriod: string;
  gpa: string;

  // Предпочтения
  practiceType: string;
  format: string;
  preferredCity: string;
  payment: string;
  github: string;
  resume: string; // имя файла резюме

  // Списки
  technicalSkills: Skill[];
  programmingLanguages: Language[];
  foreignLanguages: Language[];
  interests: string[];
  experience: Experience[];
  achievements: AchievementItem[];
};

// ----- Справочники для форм -----

export const SKILL_LEVELS: Record<SkillLevel, string> = {
  1: "Начальный",
  2: "Базовый",
  3: "Уверенный",
  4: "Продвинутый",
  5: "Эксперт",
};

export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const PROGRAMMING_LEVELS = ["Базовый", "Уверенный", "Продвинутый"];
export const PRACTICE_TYPES = ["Учебная", "Производственная", "Преддипломная"];
export const FORMATS = ["Офис", "Гибрид", "Удалённо"];
export const PAYMENTS = ["Оплачиваемая", "Неоплачиваемая", "Не важно"];
export const EDUCATION_LEVELS = ["Бакалавриат", "Специалитет", "Магистратура"];
export const EDUCATION_FORMS = ["Очная", "Очно-заочная", "Заочная"];

export const ACHIEVEMENT_KINDS: Record<AchievementKind, string> = {
  certificate: "Сертификат",
  course: "Курс",
  project: "Проект",
  conference: "Конференция",
};

// ----- Тестовые данные -----

export const defaultProfile: ProfileData = {
  fullName: "Конева Дарья Александровна",
  status: "Студентка ТИУ",
  openToOffers: true,
  photo: "",
  birthDate: "2005-09-27",
  email: "d.koneva@tyuiu.ru",
  phone: "+7 999 123-45-67",
  city: "Тюмень",

  university: "Тюменский индустриальный университет",
  faculty: "ИТиС",
  direction: "Автоматизация и телемеханика",
  course: 4,
  group: "АТК-1-23",
  educationLevel: "Бакалавриат",
  educationForm: "Очная",
  educationPeriod: "2023 — 2027",
  gpa: "4,6",

  practiceType: "Производственная",
  format: "Гибрид",
  preferredCity: "Тюмень",
  payment: "Оплачиваемая",
  github: "github.com/dkoneva",
  resume: "",

  technicalSkills: [
    { name: "Python", level: 4 },
    { name: "SQL / PostgreSQL", level: 3 },
    { name: "React", level: 3 },
    { name: "Git", level: 3 },
    { name: "Docker", level: 2 },
    { name: "Linux", level: 2 },
  ],
  programmingLanguages: [
    { name: "Python", level: "Продвинутый" },
    { name: "TypeScript", level: "Уверенный" },
    { name: "SQL", level: "Уверенный" },
    { name: "C++", level: "Базовый" },
  ],
  foreignLanguages: [
    { name: "Английский", level: "B2" },
    { name: "Немецкий", level: "A2" },
  ],
  interests: ["Веб-разработка", "Анализ данных", "Автоматизация", "UX/UI"],
  experience: [
    { title: "Учебная практика", place: "ООО «ТехноПлюс»", period: "Июль 2025 · 4 недели" },
    { title: "Организатор хакатона", place: "Студенческий совет ИТиС", period: "2024 — 2026" },
  ],
  achievements: [
    { kind: "certificate", title: "Python для анализа данных", details: "Stepik", year: "2025" },
    { kind: "certificate", title: "Основы SQL", details: "Яндекс Практикум", year: "2025" },
    { kind: "course", title: "Веб-разработка на React", details: "Coursera · 40 часов", year: "2026" },
    {
      kind: "project",
      title: "Practice.Navigator",
      details: "Сервис подбора практики · React, FastAPI",
      year: "2026",
      link: "github.com/KonevaDarya52/Practice.Navigator",
    },
    { kind: "project", title: "Бот расписания ТИУ", details: "Telegram-бот · Python, aiogram", year: "2025" },
    {
      kind: "conference",
      title: "«Новые технологии — нефтегазовому региону»",
      details: "Международная · докладчик · «Автоматизация учёта на производстве»",
      year: "2026",
    },
  ],
};

// ----- Данные, которые студент не редактирует (их считает сервис) -----

export const badges: Badge[] = [
  { icon: "star", title: "Отличник сессии" },
  { icon: "briefcase", title: "Активный участник" },
  { icon: "rocket", title: "Лучший отклик года" },
];

export const profileStats = {
  badgesTotal: 5, // сколько всего значков можно получить
  growth: 20, // на сколько процентов профиль лучше, чем в прошлом семестре
  responses: { sent: 2, viewed: 1, interview: 1 },
};

// Из чего складывается балл совпадения (слайд «Подбор: как считается совпадение»)
export const readiness: ReadinessPart[] = [
  { title: "Навыки", weight: 50, filled: 90 },
  { title: "Языки", weight: 15, filled: 100 },
  { title: "Опыт: практики, доклады", weight: 15, filled: 60 },
  { title: "Формат, город, оплата", weight: 10, filled: 100 },
  { title: "Интересы", weight: 10, filled: 100 },
];

export const recommendations: string[] = [
  "С твоими навыками Python и SQL лучше всего подходит «Стажёр-разработчик Python»: совпадение 75%.",
  "Доклад на конференции поднимает блок «Опыт» — добавь тему и ссылку на сборник.",
];
