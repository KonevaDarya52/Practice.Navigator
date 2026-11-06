import type { ProfileData } from "../data/profile";

// «Конева Дарья Александровна» → «Дарья Конева»
export function shortName(fullName: string): string {
  const [last = "", first = ""] = fullName.trim().split(/\s+/);
  return [first, last].filter(Boolean).join(" ") || "Студент";
}

// «Конева Дарья Александровна» → «ДК»
export function initials(fullName: string): string {
  const [last = "", first = ""] = fullName.trim().split(/\s+/);
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "?";
}

// «2005-09-27» → «27.09.2005»
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return y && m && d ? `${d}.${m}.${y}` : isoDate;
}

type Check = {
  done: (p: ProfileData) => boolean;
  hint: string; // что подсказать, если пункт не заполнен
};

const filled = (value: string) => value.trim().length > 0;

// Пункты, из которых считается заполненность профиля
const checks: Check[] = [
  { done: (p) => filled(p.photo), hint: "Загрузи фото профиля" },
  { done: (p) => filled(p.fullName), hint: "Укажи ФИО" },
  { done: (p) => filled(p.birthDate), hint: "Укажи дату рождения" },
  { done: (p) => filled(p.email), hint: "Укажи email" },
  { done: (p) => filled(p.phone), hint: "Укажи телефон" },
  { done: (p) => filled(p.city), hint: "Укажи город" },
  { done: (p) => filled(p.faculty), hint: "Укажи факультет" },
  { done: (p) => filled(p.direction), hint: "Укажи направление обучения" },
  { done: (p) => filled(p.group), hint: "Укажи группу" },
  { done: (p) => filled(p.educationPeriod), hint: "Укажи годы обучения" },
  { done: (p) => filled(p.practiceType), hint: "Выбери тип практики" },
  { done: (p) => filled(p.format) && filled(p.preferredCity), hint: "Укажи формат и город практики" },
  { done: (p) => filled(p.github), hint: "Добавь ссылку на GitHub" },
  { done: (p) => filled(p.resume), hint: "Загрузи резюме в формате PDF" },
  { done: (p) => p.technicalSkills.length >= 3, hint: "Добавь минимум 3 технических навыка" },
  { done: (p) => p.programmingLanguages.length > 0, hint: "Добавь языки программирования" },
  { done: (p) => p.foreignLanguages.length > 0, hint: "Добавь иностранный язык" },
  { done: (p) => p.interests.length > 0, hint: "Укажи профессиональные интересы" },
  { done: (p) => p.experience.length > 0, hint: "Добавь опыт: практику или активность" },
  { done: (p) => p.achievements.length > 0, hint: "Добавь хотя бы одно достижение" },
];

export function getCompletion(profile: ProfileData) {
  const missing = checks.filter((check) => !check.done(profile)).map((check) => check.hint);
  const percent = Math.round(((checks.length - missing.length) / checks.length) * 100);
  return { percent, missing };
}
