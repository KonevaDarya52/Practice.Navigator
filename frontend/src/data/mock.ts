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
  direction: string;
  places: number;
  paid: boolean;
  match: number;
};

export type Stat = {
  icon: string;
  value: string;
  label: string;
};

export type ProfileItem = {
  label: string;
  value: string;
};

export type Step = {
  title: string;
  state: "done" | "current" | "todo";
};

export const currentUser = {
  name: "Дарья Конева",
  role: "Студент",
  university: "Тюменский индустриальный университет",
};

export const stats: Stat[] = [
  { icon: "◎", value: "80%", label: "заполненность профиля" },
  { icon: "▣", value: "2", label: "актуальных заявок" },
  { icon: "↗", value: "2", label: "отклика отправлено" },
  { icon: "✧", value: "5+", label: "целей для подборки" },
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
    direction: "АСОиУ",
    places: 3,
    paid: true,
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
    direction: "АСОиУ",
    places: 3,
    paid: false,
    match: 58,
  },
];

export const profile = {
  completion: 80,
  items: [
    { label: "Направление и курс", value: "АСОиУ · 2 курс" },
    { label: "Навыки", value: "5 указано" },
    { label: "Опыт и достижения", value: "2 записи" },
  ] as ProfileItem[],
};

export const steps: Step[] = [
  { title: "Заявка компании", state: "done" },
  { title: "Модерация вуза", state: "done" },
  { title: "Подбор и отклик", state: "current" },
  { title: "Отбор", state: "todo" },
  { title: "Согласие", state: "todo" },
  { title: "Закрепление", state: "todo" },
];
