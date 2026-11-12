import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { plural } from "../lib/format";
import { HeroStar } from "./HeroStar";

type HeroProps = {
  firstName: string;
  loading: boolean; // заявки ещё грузятся
  total: number; // опубликованных заявок
  good: number; // из них подходят на 70%+
  goodThreshold: number;
  lackingSkills: string[]; // навыки, которых не хватает для неподходящих заявок
  completion: number; // заполненность профиля, %
};

// «Доброе утро» / «Добрый день» / … — по часам пользователя
function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Доброе утро";
  if (hour >= 12 && hour < 18) return "Добрый день";
  if (hour >= 18 && hour < 23) return "Добрый вечер";
  return "Доброй ночи";
}

// «Excel», «Excel и SCADA», «Excel, SCADA и Git»
function listSkills(skills: string[]): string {
  return skills.length <= 1 ? skills.join("") : `${skills.slice(0, -1).join(", ")} и ${skills[skills.length - 1]}`;
}

// Главный блок: личная сводка по подбору — всё из профиля и опубликованных заявок
export function Hero({ firstName, loading, total, good, goodThreshold, lackingSkills, completion }: HeroProps) {
  const skills = listSkills(lackingSkills.slice(0, 3));

  let title: string;
  let accent: string;
  let text: string;

  if (loading) {
    title = "Подбираем";
    accent = "практики для тебя…";
    text = "Сравниваем твои навыки с опубликованными заявками.";
  } else if (total === 0) {
    title = "Практик пока";
    accent = "нет";
    text = "Как только вуз опубликует первую заявку, она появится здесь, а колокольчик пришлёт уведомление.";
  } else if (good === 0) {
    title = "Подходящих практик";
    accent = "пока нет";
    text = skills
      ? `Компании чаще всего просят ${skills} — добавь их в профиль, и процент совпадения вырастет.`
      : `Ни одна из ${total} ${plural(total, "заявки", "заявок", "заявок")} не подходит на ${goodThreshold}%. Дополни навыки в профиле.`;
  } else {
    title = "Тебе подходит";
    accent = `${good} ${plural(good, "практика", "практики", "практик")} из ${total}`;
    text =
      good === total
        ? `Ты подходишь на ${goodThreshold}% и выше ко всем опубликованным заявкам — посмотри подробности.`
        : skills
          ? `Чтобы подходило больше, добавь в профиль ${skills}.`
          : `Остальные заявки подходят меньше чем на ${goodThreshold}% — посмотри, чего в них не хватает.`;
  }

  return (
    <section className="hero">
      <HeroStar />

      <div className="hero__content">
        <p className="eyebrow">
          {greeting()}
          {firstName && `, ${firstName}`}
        </p>
        <h1>
          {title} <em>{accent}</em>
        </h1>
        <p className="hero__text">{text}</p>

        <div className="hero__actions">
          {total > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => document.querySelector("#practices")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Смотреть практики <ArrowRight size={16} />
            </button>
          )}
          {completion < 100 && (
            <Link to="/profile" className={total > 0 ? "btn btn--ghost" : "btn btn--primary"}>
              Дополнить профиль {total === 0 && <ArrowRight size={16} />}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
