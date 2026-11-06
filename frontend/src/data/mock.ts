// Статичные данные главной страницы. Заявки и профиль приходят с сервера.

import { badges, profileStats } from "./profile";

export type StatIcon = "briefcase" | "file" | "send" | "star";

export type Stat = {
  icon: StatIcon;
  value: string;
  label: string;
  trend?: boolean;
};

export type HeroSlide = {
  title: string;
  accent: string;
  text: string;
  action: string;
};

export type Step = {
  title: string;
  state: "done" | "current" | "todo";
};

// Имя, инициалы и университет берутся из профиля (useProfile)
export const unreadNotifications = 2;

export const heroSlides: HeroSlide[] = [
  {
    title: "Найди свою практику",
    accent: "мечты",
    text: "Умный подбор практики с учётом твоих навыков, интересов и учебного направления.",
    action: "Начать подбор",
  },
  {
    title: "Профиль, который",
    accent: "работает",
    text: "Чем подробнее навыки, проекты и опыт, тем точнее процент совпадения с заявками.",
    action: "Заполнить профиль",
  },
  {
    title: "Откликайся",
    accent: "в один клик",
    text: "Компании видят твой профиль и приглашают на собеседование прямо в сервисе.",
    action: "Смотреть заявки",
  },
];

// Плитки на главной; заполненность профиля считается из данных профиля
export const getStats = (completion: number, requestsCount: number): Stat[] => [
  { icon: "briefcase", value: `${completion}%`, label: "Заполненность профиля", trend: true },
  { icon: "file", value: String(requestsCount), label: "Актуальных заявки" },
  { icon: "send", value: String(profileStats.responses.sent), label: "Отклика отправлено" },
  { icon: "star", value: "5+", label: "Целей для подбора" },
];

// Карточка «Твой профиль» на главной — те же значки и цифры, что в профиле
export const profileSummary = {
  badges,
  badgesTotal: profileStats.badgesTotal,
};

export const steps: Step[] = [
  { title: "Заявка компании", state: "done" },
  { title: "Модерация вуза", state: "done" },
  { title: "Подбор и отклик", state: "current" },
  { title: "Отбор", state: "todo" },
  { title: "Согласие", state: "todo" },
  { title: "Закрепление", state: "todo" },
];
