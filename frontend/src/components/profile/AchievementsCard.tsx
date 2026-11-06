import { useState } from "react";
import { useLoadedProfile } from "../../context/ProfileContext";
import {
  Award,
  BookOpen,
  FolderGit2,
  Mic,
  Pencil,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { badges, profileStats, type AchievementKind } from "../../data/profile";
import { badgeIcons } from "../BadgeIcon";
import { CardHeader } from "./CardHeader";
import type { EditTab } from "./EditProfileModal";

const kinds: { kind: AchievementKind; label: string; icon: LucideIcon }[] = [
  { kind: "certificate", label: "Сертификаты", icon: Award },
  { kind: "course", label: "Курсы", icon: BookOpen },
  { kind: "project", label: "Проекты", icon: FolderGit2 },
  { kind: "conference", label: "Конференции", icon: Mic },
];

type Props = {
  onEdit: (tab: EditTab) => void;
};

export function AchievementsCard({ onEdit }: Props) {
  const { profile } = useLoadedProfile();
  const achievementItems = profile.achievements;
  const [active, setActive] = useState<AchievementKind>("certificate");
  const items = achievementItems.filter((item) => item.kind === active);
  const ActiveIcon = kinds.find((k) => k.kind === active)!.icon;

  return (
    <div className="card">
      <CardHeader
        icon={Trophy}
        title="Мои достижения"
        action={
          <button type="button" className="link-btn" onClick={() => onEdit("achievements")}>
            <Pencil size={13} /> Изменить
          </button>
        }
      />

      <div className="badges-head">
        <span>Мои значки</span>
        <b>
          {badges.length} / {profileStats.badgesTotal}
        </b>
      </div>
      <div className="badges">
        {badges.map(({ icon, title }) => {
          const Icon = badgeIcons[icon];
          return (
            <div className="badge" key={title}>
              <span className="badge__icon">
                <Icon size={22} />
              </span>
              <span>{title}</span>
            </div>
          );
        })}
      </div>

      <div className="tabs" role="tablist">
        {kinds.map(({ kind, label }) => {
          const count = achievementItems.filter((item) => item.kind === kind).length;
          return (
            <button
              key={kind}
              role="tab"
              aria-selected={active === kind}
              className={active === kind ? "tab tab--active" : "tab"}
              onClick={() => setActive(kind)}
            >
              {label} <span className="tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="achievement-list">
        {items.length === 0 && <li className="muted small">В этом разделе пока пусто</li>}
        {items.map((item, i) => (
          <li key={i} className="achievement-item">
            <span className="achievement-item__icon">
              <ActiveIcon size={18} />
            </span>
            <div className="achievement-item__body">
              <b>{item.title}</b>
              <span className="muted">{item.details}</span>
              {item.link && <span className="achievement-item__link">{item.link}</span>}
            </div>
            <span className="achievement-item__year">{item.year}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressBanner() {
  return (
    <div className="progress-banner">
      <TrendingUp size={36} className="progress-banner__icon" />
      <div>
        <b>Твой прогресс</b>
        <span>На {profileStats.growth}% выше, чем в прошлом семестре</span>
      </div>
      <svg className="progress-banner__bars" viewBox="0 0 90 50" aria-hidden="true">
        <rect x="0" y="34" width="12" height="16" rx="2" />
        <rect x="20" y="26" width="12" height="24" rx="2" />
        <rect x="40" y="18" width="12" height="32" rx="2" />
        <rect x="60" y="8" width="12" height="42" rx="2" />
      </svg>
    </div>
  );
}
