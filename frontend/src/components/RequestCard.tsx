import { ArrowRight, Building2, Check } from "lucide-react";
import type { PracticeRequest } from "../api/types";
import { companyInitials, formatDate } from "../lib/format";

type RequestCardProps = {
  request: PracticeRequest;
  match: number | null;
  mySkills: Set<string>; // навыки студента в нижнем регистре — чтобы отметить совпавшие
  onOpen: () => void;
};

const MAX_SKILLS = 5;

// Цвет процента: зелёный — подходит, жёлтый — частично, серый — пока нет
export function matchTone(match: number): string {
  return match >= 70 ? "match" : match >= 40 ? "match match--mid" : "match match--low";
}

export function RequestCard({ request, match, mySkills, onOpen }: RequestCardProps) {
  const skills = request.requiredSkills.slice(0, MAX_SKILLS);
  const more = request.requiredSkills.length - skills.length;

  return (
    <article className="request-card">
      <div className="request-card__logo">{companyInitials(request.organization.name)}</div>

      <div className="request-card__body">
        <h4>{request.title}</h4>
        <p className="request-card__meta">
          <span>
            <Building2 size={13} /> {request.organization.name}
          </span>
          {request.city && <span>{request.city}</span>}
          <span>{request.format}</span>
          {(request.dateFrom || request.dateTo) && (
            <span>
              {formatDate(request.dateFrom)} — {formatDate(request.dateTo)}
            </span>
          )}
        </p>
        {request.description && <p className="request-card__text">{request.description}</p>}

        {skills.length > 0 && (
          <ul className="skill-tags" aria-label="Требуемые навыки">
            {skills.map((skill) => {
              const have = mySkills.has(skill.toLowerCase());
              return (
                <li key={skill} className={have ? "skill-tag skill-tag--have" : "skill-tag"} title={have ? "Есть в твоём профиле" : "Нет в профиле"}>
                  {have && <Check size={11} strokeWidth={3} />}
                  {skill}
                </li>
              );
            })}
            {more > 0 && <li className="skill-tag skill-tag--more">+{more}</li>}
          </ul>
        )}
      </div>

      <div className="request-card__side">
        {match !== null && <span className={matchTone(match)}>{match}% совпадение</span>}
        <button type="button" className="btn btn--outline btn--sm" onClick={onOpen}>
          Подробнее <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}
