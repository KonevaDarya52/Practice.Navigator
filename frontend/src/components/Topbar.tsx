import { Bell, ChevronDown, GraduationCap, Menu, Moon, Sun } from "lucide-react";
import { currentUser } from "../data/mock";
import type { Theme } from "../hooks/useTheme";

type TopbarProps = {
  theme: Theme;
  onToggleTheme: () => void;
  onMenuClick: () => void;
};

export function Topbar({ theme, onToggleTheme, onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="icon-btn menu-btn" aria-label="Открыть меню" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <button className="university">
          <GraduationCap size={22} strokeWidth={1.8} />
          <span className="university__name">{currentUser.university}</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="topbar__right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
          title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn icon-btn--dot" aria-label="Уведомления">
          <Bell size={20} />
        </button>
        <button className="user">
          <span className="avatar">{currentUser.initials}</span>
          <span className="user__name">{currentUser.name}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
