import { ArrowRight, Flame, Star, Trophy, type LucideIcon } from "lucide-react";
import type { Achievement, AchievementIcon } from "../data/mock";

const icons: Record<AchievementIcon, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
};

type ProfileCardProps = {
  completion: number;
  achievements: Achievement[];
  achievementsTotal: number;
};

// Кольцо прогресса: длина окружности r=34 ≈ 213.6
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileCard({ completion, achievements, achievementsTotal }: ProfileCardProps) {
  const earned = achievements.filter((a) => a.earned).length;

  return (
    <div className="card profile-card">
      <h3>Твой профиль</h3>

      <div className="profile-card__summary">
        <svg className="ring" viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--accent-light)" }} />
              <stop offset="1" style={{ stopColor: "var(--accent)" }} />
            </linearGradient>
          </defs>
          <circle className="ring__track" cx="40" cy="40" r={RADIUS} />
          <circle
            className="ring__value"
            cx="40"
            cy="40"
            r={RADIUS}
            stroke="url(#ring-gradient)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - completion / 100)}
          />
          <text x="40" y="46" textAnchor="middle" className="ring__text">
            {completion}%
          </text>
        </svg>
        <p className="muted">Заполненность профиля</p>
      </div>

      <div className="progress-row">
        <span>Мои достижения</span>
        <a href="#" className="link">
          Редактировать <ArrowRight size={13} />
        </a>
      </div>
      <div className="progress">
        <span style={{ width: `${(earned / achievementsTotal) * 100}%` }} />
      </div>
      <div className="progress-count">
        {earned} / {achievementsTotal}
      </div>

      <div className="achievements">
        {achievements.map(({ icon, title }) => {
          const Icon = icons[icon];
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
