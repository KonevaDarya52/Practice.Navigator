import { Bell, Building2, GraduationCap, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { unreadNotifications } from "../data/mock";
import type { Theme } from "../hooks/useTheme";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

type TopbarProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

const UNIVERSITY = "Тюменский индустриальный университет";

export function Topbar({ theme, onToggleTheme }: TopbarProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Слева от имени: компания для её представителя, вуз — для остальных
  const place =
    user?.role === "company" ? user.organization?.name ?? "Компания" : (profile?.university || UNIVERSITY);
  const PlaceIcon = user?.role === "company" ? Building2 : GraduationCap;

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__left">
          <Logo />
          <span className="university">
            <PlaceIcon size={22} strokeWidth={1.8} />
            <span className="university__name">{place}</span>
          </span>
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
          {/* Уведомления пока демонстрационные — настоящие появятся в спринте 4 */}
          {user?.role === "student" && (
            <button className="icon-btn" aria-label={`Уведомления: ${unreadNotifications} новых`}>
              <Bell size={20} />
              {unreadNotifications > 0 && <span className="icon-btn__badge">{unreadNotifications}</span>}
            </button>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
