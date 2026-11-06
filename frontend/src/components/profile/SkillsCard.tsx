import { Briefcase, Code2, Pencil } from "lucide-react";
import { useLoadedProfile } from "../../context/ProfileContext";
import { SKILL_LEVELS } from "../../data/profile";
import { CardHeader } from "./CardHeader";
import type { EditTab } from "./EditProfileModal";

type CardProps = {
  onEdit: (tab: EditTab) => void;
};

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="link-btn" type="button" onClick={onClick}>
      <Pencil size={13} /> Изменить
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="muted small">{text}</p>;
}

export function SkillsCard({ onEdit }: CardProps) {
  const { profile } = useLoadedProfile();

  return (
    <div className="card">
      <CardHeader icon={Code2} title="Мои навыки" action={<EditButton onClick={() => onEdit("skills")} />} />

      <p className="card-subtitle card-subtitle--first">Технические навыки</p>
      {profile.technicalSkills.length === 0 && <Empty text="Навыки пока не добавлены" />}
      <ul className="skill-list">
        {profile.technicalSkills.map((skill, i) => (
          <li key={i} className="skill">
            <span className="skill__name">{skill.name}</span>
            <span className="skill__dots" aria-label={`${skill.level} из 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <i key={n} className={n <= skill.level ? "on" : undefined} />
              ))}
            </span>
            <span className="skill__level">{SKILL_LEVELS[skill.level]}</span>
          </li>
        ))}
      </ul>

      <div className="skills-columns">
        <div>
          <p className="card-subtitle">Языки программирования</p>
          {profile.programmingLanguages.length === 0 && <Empty text="Не указаны" />}
          <ul className="lang-list">
            {profile.programmingLanguages.map((lang, i) => (
              <li key={i}>
                <span>{lang.name}</span>
                <span className="muted">{lang.level}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="card-subtitle">Иностранные языки</p>
          {profile.foreignLanguages.length === 0 && <Empty text="Не указаны" />}
          <ul className="lang-list">
            {profile.foreignLanguages.map((lang, i) => (
              <li key={i}>
                <span>{lang.name}</span>
                <span className="level-chip">{lang.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="card-subtitle">Профессиональные интересы</p>
      {profile.interests.length === 0 && <Empty text="Интересы не указаны" />}
      <div className="chips">
        {profile.interests.map((interest) => (
          <span className="chip chip--accent" key={interest}>
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ExperienceCard({ onEdit }: CardProps) {
  const { profile } = useLoadedProfile();

  return (
    <div className="card">
      <CardHeader icon={Briefcase} title="Опыт и активность" action={<EditButton onClick={() => onEdit("experience")} />} />
      {profile.experience.length === 0 && <Empty text="Добавь практику, работу или студенческую активность" />}
      <ul className="timeline">
        {profile.experience.map((item, i) => (
          <li key={i}>
            <b>{item.title}</b>
            <span>{item.place}</span>
            <span className="muted">{item.period}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
