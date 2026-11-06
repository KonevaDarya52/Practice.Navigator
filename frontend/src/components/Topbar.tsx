import { Bell, ChevronDown, GraduationCap, Moon, Sun } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { unreadNotifications } from "../data/mock";
import type { Theme } from "../hooks/useTheme";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

type TopbarProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function Topbar({ theme, onToggleTheme }: TopbarProps) {
  const { profile } = useProfile();

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__left">
          <Logo />
          <button className="university">
            <GraduationCap size={22} strokeWidth={1.8} />
            <span className="university__name">{profile.university}</span>
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
          <button
            className="icon-btn"
            aria-label={`Уведомления: ${unreadNotifications} новых`}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="icon-btn__badge">{unreadNotifications}</span>
            )}
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
