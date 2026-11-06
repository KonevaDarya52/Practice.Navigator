// Тестовые данные для главной страницы.
// Когда будет готов backend, они будут приходить из API.

export type PracticeRequest = {
  id: number;
  companyShort: string;
  title: string;
  company: string;
  city: string;
  format: "Офис" | "Гибрид" | "Удалённо";
  dateFrom: string;
  dateTo: string;
  description: string;
  match: number;
};

export type StatIcon = "briefcase" | "file" | "send" | "star";

export type Stat = {
  icon: StatIcon;
  value: string;
  label: string;
  trend?: boolean;
};

export type AchievementIcon = "trophy" | "star" | "flame";

export type Achievement = {
  icon: AchievementIcon;
  title: string;
  earned: boolean;
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

export const currentUser = {
  name: "Дарья Конева",
  initials: "ДК",
  university: "Тюменский индустриальный университет",
  unreadNotifications: 2,
};

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

export const stats: Stat[] = [
  { icon: "briefcase", value: "80%", label: "Заполненность профиля", trend: true },
  { icon: "file", value: "2", label: "Актуальных заявки" },
  { icon: "send", value: "2", label: "Отклика отправлено" },
  { icon: "star", value: "5+", label: "Целей для подбора" },
];

export const requests: PracticeRequest[] = [
  {
    id: 1,
    companyShort: "ТЕ",
    title: "Стажёр-разработчик Python",
    company: "ООО «ТехноПлюс»",
    city: "Тюмень",
    format: "Гибрид",
    dateFrom: "01.02.2027",
    dateTo: "30.04.2027",
    description: "Участие в разработке внутренних инструментов компании под руководством наставника.",
    match: 75,
  },
  {
    id: 2,
    companyShort: "ТЮ",
    title: "Практикант отдела автоматизации",
    company: "АО «Тюменский НПЗ»",
    city: "Тюмень",
    format: "Офис",
    dateFrom: "10.02.2027",
    dateTo: "10.04.2027",
    description: "Знакомство с задачами цифровизации производственных процессов.",
    match: 58,
  },
];

export const profile = {
  completion: 80,
  achievementsTotal: 5,
  achievements: [
    { icon: "trophy", title: "Активный студент", earned: true },
    { icon: "star", title: "Исследователь", earned: true },
    { icon: "flame", title: "Профи", earned: true },
  ] as Achievement[],
};

export const steps: Step[] = [
  { title: "Заявка компании", state: "done" },
  { title: "Модерация вуза", state: "done" },
  { title: "Подбор и отклик", state: "current" },
  { title: "Отбор", state: "todo" },
  { title: "Согласие", state: "todo" },
  { title: "Закрепление", state: "todo" },
];
