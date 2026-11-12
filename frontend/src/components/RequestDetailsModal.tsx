import { useEffect, useRef } from "react";
import { Building2, Check, X } from "lucide-react";
import type { PracticeRequest } from "../api/types";
import { formatDate, plural } from "../lib/format";
import { matchTone } from "./RequestCard";
import "../styles/form.css";

type Props = {
  request: PracticeRequest;
  match: number | null;
  mySkills: Set<string>;
  onClose: () => void;
};

// Полная заявка: всё, что компания указала при создании
export function RequestDetailsModal({ request, match, mySkills, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Esc закрывает окно, страница под окном не прокручивается
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const facts: [string, string][] = [
    ["Тип практики", request.practiceType],
    ["Формат", request.format],
    ["Город", [request.city, request.address].filter(Boolean).join(", ")],
    ["Сроки", request.dateFrom || request.dateTo ? `${formatDate(request.dateFrom)} — ${formatDate(request.dateTo)}` : ""],
    ["Приём откликов до", request.deadline ? formatDate(request.deadline) : ""],
    ["Мест", `${request.places} ${plural(request.places, "место", "места", "мест")}`],
    ["Оплата", request.paid ? "Оплачиваемая" : "Без оплаты"],
    ["Курсы", request.courses.length ? [...request.courses].sort((a, b) => a - b).join(", ") : ""],
    ["Направления", request.directions.join(", ")],
    ["Наставник", request.mentor],
  ];

  const skillList = (title: string, skills: string[]) =>
    skills.length > 0 && (
      <section className="details__section">
        <h3>{title}</h3>
        <ul className="skill-tags">
          {skills.map((skill) => {
            const have = mySkills.has(skill.toLowerCase());
            return (
              <li key={skill} className={have ? "skill-tag skill-tag--have" : "skill-tag"}>
                {have && <Check size={11} strokeWidth={3} />}
                {skill}
              </li>
            );
          })}
        </ul>
      </section>
    );

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal details" role="dialog" aria-modal="true" aria-labelledby="details-title" tabIndex={-1} ref={dialogRef}>
        <header className="modal__head">
          <div>
            <h2 id="details-title">{request.title}</h2>
            <p className="details__org">
              <Building2 size={14} /> {request.organization.name}
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </header>

        <div className="modal__body details__body">
          {match !== null && (
            <p className="details__match">
              <span className={matchTone(match)}>{match}% совпадение</span>
              <span className="muted small">по навыкам: обязательные дают 70%, желательные — 30%</span>
            </p>
          )}

          {request.description && <p className="details__text">{request.description}</p>}

          <dl className="details__facts">
            {facts
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>

          {request.tasks.length > 0 && (
            <section className="details__section">
              <h3>Задачи практиканта</h3>
              <ul className="details__tasks">
                {request.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </section>
          )}

          {skillList("Обязательные навыки", request.requiredSkills)}
          {skillList("Желательные навыки", request.desiredSkills)}
          {(request.requiredSkills.length > 0 || request.desiredSkills.length > 0) && (
            <p className="muted small">
              <Check size={11} strokeWidth={3} /> — навык есть в твоём профиле
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
