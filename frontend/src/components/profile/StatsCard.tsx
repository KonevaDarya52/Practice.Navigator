import { BarChart3 } from "lucide-react";
import { useLoadedProfile } from "../../context/ProfileContext";
import { ProgressRing } from "../ProgressRing";
import { CardHeader } from "./CardHeader";

// Только то, что есть в профиле. Отклики появятся, когда в сервисе будет функция откликов
export function StatsCard() {
  const { profile, completion } = useLoadedProfile();

  const legend = [
    { label: "Заполненность профиля", value: `${completion}%` },
    { label: "Технических навыков", value: String(profile.technicalSkills.length) },
    { label: "Языков программирования", value: String(profile.programmingLanguages.length) },
    { label: "Записей об опыте", value: String(profile.experience.length) },
    { label: "Достижений", value: String(profile.achievements.length) },
  ];

  return (
    <div className="card">
      <CardHeader icon={BarChart3} title="Статистика профиля" />

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
    </div>
  );
}
