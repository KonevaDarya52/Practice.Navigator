import { useState } from "react";
import { X } from "lucide-react";
import {
  ORG_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  type OrganizationStatus,
  type PracticeRequest,
  type RequestStatus,
} from "../../api/types";
import { formatDate, plural } from "../../lib/format";

// Цветная плашка статуса заявки или компании
export function StatusBadge({ status }: { status: RequestStatus | OrganizationStatus }) {
  const label =
    (REQUEST_STATUS_LABELS as Record<string, string>)[status] ?? (ORG_STATUS_LABELS as Record<string, string>)[status];
  return <span className={`status status--${status}`}>{label}</span>;
}

// Подробности заявки: одинаково показываются компании и модератору
export function RequestDetails({ request }: { request: PracticeRequest }) {
  const rows: [string, string][] = [
    ["Тип практики", request.practiceType],
    ["Направления", request.directions.join(", ") || "—"],
    ["Курсы", request.courses.length ? request.courses.join(", ") : "—"],
    ["Места", `${request.places} ${plural(request.places, "место", "места", "мест")}`],
    ["Даты", `${formatDate(request.dateFrom)} — ${formatDate(request.dateTo)}`],
    ["Дедлайн откликов", formatDate(request.deadline)],
    ["Формат", [request.format, request.city, request.address].filter(Boolean).join(" · ")],
    ["Оплата", request.paid ? "Оплачиваемая" : "Неоплачиваемая"],
    ["Наставник", request.mentor || "—"],
  ];

  return (
    <div className="request-details">
      {request.description && <p className="request-details__text">{request.description}</p>}

      <dl className="request-details__grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {request.tasks.length > 0 && (
        <>
          <p className="card-subtitle">Задачи практиканта</p>
          <ul className="request-details__tasks">
            {request.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </>
      )}

      {(request.requiredSkills.length > 0 || request.desiredSkills.length > 0) && (
        <div className="chips request-details__skills">
          {request.requiredSkills.map((s) => (
            <span key={s} className="chip chip--accent" title="Обязательный навык">
              {s}
            </span>
          ))}
          {request.desiredSkills.map((s) => (
            <span key={s} className="chip" title="Желательный навык">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Выбор нескольких значений из списка (навыки, направления)
type ChipPickerProps = {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
};

export function ChipPicker({ label, value, options, onChange, placeholder }: ChipPickerProps) {
  const [choice, setChoice] = useState("");
  const rest = options.filter((o) => !value.includes(o));

  return (
    <div className="field field--wide">
      <span className="form-label form-label--inline">{label}</span>
      {value.length > 0 && (
        <div className="chips">
          {value.map((item) => (
            <span className="chip chip--accent chip--removable" key={item}>
              {item}
              <button type="button" aria-label={`Убрать «${item}»`} onClick={() => onChange(value.filter((v) => v !== item))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <select
        aria-label={label}
        value={choice}
        onChange={(e) => {
          if (e.target.value) onChange([...value, e.target.value]);
          setChoice("");
        }}
      >
        <option value="">{placeholder}</option>
        {rest.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
