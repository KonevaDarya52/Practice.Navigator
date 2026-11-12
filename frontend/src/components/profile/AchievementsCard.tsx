import { Trophy } from "lucide-react";
import { useLoadedProfile } from "../../context/ProfileContext";
import { badgeIcons } from "../BadgeIcon";
import { CardHeader } from "./CardHeader";

// Значки за действия в профиле. Неполученные — бледные, в подсказке написано, что сделать
export function AchievementsCard() {
  const { badges } = useLoadedProfile();
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="card">
      <CardHeader icon={Trophy} title="Мои значки" />

      <div className="badges-head">
        <span>Получено</span>
        <b>
          {earned} / {badges.length}
        </b>
      </div>
      <div className="badges">
        {badges.map(({ icon, title, hint, earned }) => {
          const Icon = badgeIcons[icon];
          return (
            <div className={earned ? "badge" : "badge badge--locked"} key={title} title={earned ? title : hint}>
              <span className="badge__icon">
                <Icon size={22} />
              </span>
              <span>{title}</span>
              {!earned && <span className="badge__hint">{hint}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
