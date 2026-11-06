import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Badge } from "../data/profile";
import { badgeIcons } from "./BadgeIcon";
import { ProgressRing } from "./ProgressRing";

type ProfileCardProps = {
  completion: number;
  badges: Badge[];
  badgesTotal: number;
};

export function ProfileCard({ completion, badges, badgesTotal }: ProfileCardProps) {
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
        <span style={{ width: `${(badges.length / badgesTotal) * 100}%` }} />
      </div>
      <div className="progress-count">
        {badges.length} / {badgesTotal}
      </div>

      <div className="achievements">
        {badges.map(({ icon, title }) => {
          const Icon = badgeIcons[icon];
          return (
            <div className="achievement" key={title}>
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
