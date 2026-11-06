import { BarChart3, ChevronDown } from "lucide-react";
import { useLoadedProfile } from "../../context/ProfileContext";
import { profileStats } from "../../data/profile";
import { ProgressRing } from "../ProgressRing";
import { CardHeader } from "./CardHeader";

export function StatsCard() {
  const { profile, completion } = useLoadedProfile();
  const { responses } = profileStats;

  const legend = [
    { label: "Заполненность профиля", value: `${completion}%` },
    { label: "Навыков указано", value: String(profile.technicalSkills.length) },
    { label: "Достижений", value: String(profile.achievements.length) },
    { label: "Откликов отправлено", value: String(responses.sent) },
  ];

  return (
    <div className="card">
      <CardHeader
        icon={BarChart3}
        title="Статистика профиля"
        action={
          <button className="select-btn" type="button">
            За семестр <ChevronDown size={14} />
          </button>
        }
      />

      <div className="stats-summary">
        <ProgressRing value={completion} size={104} />
        <ul className="legend">
          {legend.map((item) => (
            <li key={item.label}>
              <i />
              <span>{item.label}</span>
              <b>{item.value}</b>
            </li>
          ))}
        </ul>
      </div>

      <p className="card-subtitle">Активность откликов</p>
      <div className="funnel">
        <div>
          <b>{responses.sent}</b>
          <span>Отправлено</span>
        </div>
        <div>
          <b>{responses.viewed}</b>
          <span>Просмотрено</span>
        </div>
        <div>
          <b>{responses.interview}</b>
          <span>Собеседование</span>
        </div>
      </div>
    </div>
  );
}
