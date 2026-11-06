import { FileText, GitBranch, GraduationCap, MapPin, User } from "lucide-react";
import { useLoadedProfile } from "../../context/ProfileContext";
import { formatDate } from "../../lib/profile";
import { CardHeader } from "./CardHeader";
import type { EditTab } from "./EditProfileModal";

type Row = { label: string; value: string };

type CardProps = {
  onEdit: (tab: EditTab) => void;
};

// Пустые значения показываем прочерком
function InfoList({ rows }: { rows: Row[] }) {
  return (
    <dl className="info-list">
      {rows.map((row) => (
        <div className="info-list__row" key={row.label}>
          <dt>{row.label}</dt>
          <dd className={row.value ? undefined : "muted"}>{row.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="link-btn" type="button" onClick={onClick}>
      Редактировать
    </button>
  );
}

export function PersonalCard({ onEdit }: CardProps) {
  const { profile } = useLoadedProfile();

  return (
    <div className="card">
      <CardHeader icon={User} title="Личные данные" action={<EditButton onClick={() => onEdit("personal")} />} />
      <InfoList
        rows={[
          { label: "ФИО", value: profile.fullName },
          { label: "Дата рождения", value: formatDate(profile.birthDate) },
          { label: "Email", value: profile.email },
          { label: "Телефон", value: profile.phone },
          { label: "Город", value: profile.city },
        ]}
      />

      <p className="card-subtitle">Учёба</p>
      <InfoList
        rows={[
          { label: "Факультет", value: profile.faculty },
          { label: "Направление", value: profile.direction },
          { label: "Курс", value: `${profile.course} курс` },
          { label: "Группа", value: profile.group },
        ]}
      />
    </div>
  );
}

export function EducationCard({ onEdit }: CardProps) {
  const { profile } = useLoadedProfile();

  return (
    <div className="card">
      <CardHeader icon={GraduationCap} title="Образование" action={<EditButton onClick={() => onEdit("study")} />} />
      <div className="education">
        <b>{profile.university}</b>
        <span className="muted">
          {[profile.educationLevel, profile.educationForm, profile.educationPeriod].filter(Boolean).join(" · ")}
        </span>
        {profile.gpa && (
          <span className="education__gpa">
            Средний балл <b>{profile.gpa}</b>
          </span>
        )}
      </div>
    </div>
  );
}

export function PreferencesCard({ onEdit }: CardProps) {
  const { profile } = useLoadedProfile();

  return (
    <div className="card">
      <CardHeader icon={MapPin} title="Предпочтения" action={<EditButton onClick={() => onEdit("preferences")} />} />
      <InfoList
        rows={[
          { label: "Тип практики", value: profile.practiceType },
          { label: "Формат", value: profile.format },
          { label: "Город", value: profile.preferredCity },
          { label: "Оплата", value: profile.payment },
        ]}
      />

      <p className="card-subtitle">Ссылки</p>
      <div className="links">
        {profile.github ? (
          <span className="file-link">
            <GitBranch size={16} /> {profile.github}
          </span>
        ) : (
          <button className="file-link file-link--empty" onClick={() => onEdit("preferences")}>
            <GitBranch size={16} /> Добавить GitHub
          </button>
        )}
        {profile.resume ? (
          <span className="file-link">
            <FileText size={16} /> {profile.resume}
          </span>
        ) : (
          <button className="file-link file-link--empty" onClick={() => onEdit("preferences")}>
            <FileText size={16} /> Загрузить резюме (PDF)
          </button>
        )}
      </div>
    </div>
  );
}
