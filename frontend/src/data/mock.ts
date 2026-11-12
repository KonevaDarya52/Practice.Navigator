// Статичные тексты главной страницы (этапы). Цифры считаются из профиля и заявок.

export type StatIcon = "briefcase" | "file" | "code" | "star";

export type Stat = {
  icon: StatIcon;
  value: string;
  label: string;
  trend?: boolean;
};

export type Step = {
  title: string;
  state: "done" | "current" | "todo";
};


// Этапы распределения. Какой из них текущий, считается на главной по данным студента
export const STEP_TITLES = ["Заявка компании", "Модерация вуза", "Подбор и отклик", "Отбор", "Согласие", "Закрепление"];
