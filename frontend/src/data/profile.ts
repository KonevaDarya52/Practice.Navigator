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

// Значок за действие в профиле (правила — в lib/progress.ts)
export type Badge = {
  icon: "star" | "file" | "code" | "briefcase" | "award";
  title: string;
  hint: string; // что сделать, чтобы получить
  earned: boolean;
};

export type ReadinessPart = {
  title: string;
  weight: number; // вес в балле совпадения, %
  filled: number; // насколько заполнено, %
  detail: string; // «3 из 5» — откуда взялся процент
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

  // Настройки (меняются переключателями, сохраняются сразу)
  notificationsEnabled: boolean;
  contactsAfterResponse: boolean;

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

export const recommendations: string[] = [
  "Процент совпадения на главной считается по твоим навыкам — добавь все, которыми владеешь.",
  "Доклад на конференции поднимает блок «Опыт» — добавь тему и ссылку на сборник.",
];
