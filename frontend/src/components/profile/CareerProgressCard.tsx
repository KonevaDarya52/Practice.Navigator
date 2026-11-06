import { Bell, ChevronRight, CircleAlert, Lightbulb, Lock, Palette, Target } from "lucide-react";
import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { readiness, recommendations } from "../../data/profile";
import type { Theme } from "../../hooks/useTheme";
import { Toggle } from "../Toggle";
import { CardHeader } from "./CardHeader";

// Готовность к подбору = сумма (вес компонента × насколько он заполнен)
const readinessScore = Math.round(
  readiness.reduce((sum, part) => sum + (part.weight * part.filled) / 100, 0),
);

export function CareerProgressCard() {
  // Что добавить — первые незаполненные пункты профиля
  const { missing } = useProfile();
  const missingData = missing.slice(0, 3);

  return (
    <div className="card">
      <CardHeader icon={Target} title="Карьерный прогресс" />

      <div className="readiness">
        <div className="readiness__head">
          <span>Готовность к подбору</span>
          <b>{readinessScore}%</b>
        </div>
        <div className="progress progress--lg">
          <span style={{ width: `${readinessScore}%` }} />
        </div>
      </div>

      <ul className="readiness-parts">
        {readiness.map((part) => (
          <li key={part.title}>
            <div className="readiness-parts__row">
              <span>{part.title}</span>
              <span className="muted">вес {part.weight}%</span>
            </div>
            <div className="progress">
              <span style={{ width: `${part.filled}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <p className="card-subtitle">Что стоит добавить</p>
      {missingData.length === 0 && <p className="muted small">Профиль заполнен полностью</p>}
      <ul className="hint-list">
        {missingData.map((text) => (
          <li key={text}>
            <CircleAlert size={16} className="hint-list__warn" />
            {text}
          </li>
        ))}
      </ul>

      <p className="card-subtitle">Рекомендации</p>
      <ul className="hint-list">
        {recommendations.map((text) => (
          <li key={text}>
            <Lightbulb size={16} className="hint-list__tip" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

type SettingsCardProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function SettingsCard({ theme, onToggleTheme }: SettingsCardProps) {
  const [notifications, setNotifications] = useState(true);
  const [hideContacts, setHideContacts] = useState(true);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Настройки</h3>
        <ChevronRight size={18} className="card-header__action muted" />
      </div>
      <ul className="settings">
        <li>
          <Bell size={16} />
          <span>Уведомления</span>
          <Toggle
            checked={notifications}
            onChange={() => setNotifications((v) => !v)}
            label="Уведомления"
          />
        </li>
        <li>
          <Lock size={16} />
          <span>Контакты только после отклика</span>
          <Toggle
            checked={hideContacts}
            onChange={() => setHideContacts((v) => !v)}
            label="Показывать контакты только после отклика"
          />
        </li>
        <li>
          <Palette size={16} />
          <span>Тёмная тема</span>
          <Toggle checked={theme === "dark"} onChange={onToggleTheme} label="Тёмная тема" />
        </li>
      </ul>
    </div>
  );
}
