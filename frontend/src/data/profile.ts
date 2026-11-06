// Данные профиля студента.
// Поля повторяют анкету студента из проекта (слайд «Анкета и заявка компании»).
// Сам профиль хранится на сервере (GET/PUT /api/v1/profile/me), см. context/ProfileContext.tsx.

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
  "Процент совпадения на главной считается по твоим навыкам — добавь все, которыми владеешь.",
  "Доклад на конференции поднимает блок «Опыт» — добавь тему и ссылку на сборник.",
];
