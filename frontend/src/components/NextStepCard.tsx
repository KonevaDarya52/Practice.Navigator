import { ArrowRight, CircleAlert, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  lackingSkills: string[]; // навыки из опубликованных заявок, которых нет в профиле (сначала самые частые)
  missing: string[]; // незаполненные пункты профиля
};

const MAX_SKILLS = 6;
const MAX_HINTS = 3;

// «Как поднять совпадение»: что конкретно добавить в профиль, чтобы подходить большему числу заявок
export function NextStepCard({ lackingSkills, missing }: Props) {
  const skills = lackingSkills.slice(0, MAX_SKILLS);
  const hints = missing.slice(0, MAX_HINTS);
  const done = skills.length === 0 && hints.length === 0;

  return (
    <div className="card next-step">
      <Rocket className="next-step__rocket" size={40} strokeWidth={1.4} aria-hidden="true" />
      <h3>{done ? "Профиль готов к подбору" : "Как поднять совпадение"}</h3>

      {done && <p className="muted small">У тебя есть все навыки из опубликованных заявок и заполнены все пункты профиля.</p>}

      {skills.length > 0 && (
        <>
          <p className="next-step__label">Навыки, которые чаще всего просят компании</p>
          <ul className="skill-tags">
            {skills.map((skill) => (
              <li key={skill} className="skill-tag">
                {skill}
              </li>
            ))}
          </ul>
        </>
      )}

      {hints.length > 0 && (
        <>
          <p className="next-step__label">Что дополнить в профиле</p>
          <ul className="hint-list next-step__hints">
            {hints.map((text) => (
              <li key={text}>
                <CircleAlert size={15} />
                {text}
              </li>
            ))}
          </ul>
        </>
      )}

      {!done && (
        <Link to="/profile" className="btn btn--primary btn--sm next-step__btn">
          Дополнить профиль <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
