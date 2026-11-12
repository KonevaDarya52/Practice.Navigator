import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Badge } from "../data/profile";
import { badgeIcons } from "./BadgeIcon";
import { ProgressRing } from "./ProgressRing";

type ProfileCardProps = {
  completion: number;
  badges: Badge[]; // все значки, полученные отмечены earned
};

export function ProfileCard({ completion, badges }: ProfileCardProps) {
  const got = badges.filter((b) => b.earned);
  const total = badges.length || 1;
  return (
    <div className="card profile-card">
      <h3>Твой профиль</h3>

      <div className="profile-card__summary">
        <ProgressRing value={completion} />
        <p className="muted">Заполненность профиля</p>
      </div>

      <div className="progress-row">
        <span>Мои значки</span>
        <Link to="/profile" className="link">
          В профиль <ArrowRight size={13} />
        </Link>
      </div>
      <div className="progress">
        <span style={{ width: `${(got.length / total) * 100}%` }} />
      </div>
      <div className="progress-count">
        {got.length} / {badges.length}
      </div>

      <div className="achievements">
        {badges.map(({ icon, title, hint, earned }) => {
          const Icon = badgeIcons[icon];
          return (
            <div className={earned ? "achievement" : "achievement achievement--locked"} key={title} title={earned ? title : hint}>
              <span className="achievement__icon">
                <Icon size={20} />
              </span>
              <span>{title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
