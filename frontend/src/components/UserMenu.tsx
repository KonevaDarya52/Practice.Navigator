import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Home,
  Inbox,
  LogOut,
  Search,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { ROLE_LABELS, type Role } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { initials as getInitials, shortName } from "../lib/profile";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  // Страницы без адреса ещё не сделаны
  to?: string;
};

// У каждой роли своё меню. Уведомления открываются колокольчиком в шапке
const MENU: Record<Role, MenuItem[]> = {
  student: [
    { icon: Home, label: "Главная", to: "/" },
    { icon: User, label: "Мой профиль", to: "/profile" },
    { icon: Search, label: "Подбор практики" },
    { icon: Inbox, label: "Мои отклики" },
  ],
  company: [{ icon: Building2, label: "Кабинет компании", to: "/company" }],
  moderator: [{ icon: ShieldCheck, label: "Модерация", to: "/moderation" }],
  admin: [{ icon: ShieldCheck, label: "Модерация", to: "/moderation" }],
};

// Выпадающее меню под именем пользователя: вся навигация по сервису
export function UserMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  // Закрываем меню при переходе на другую страницу
  useEffect(() => setOpen(false), [location.pathname]);

  // Закрываем меню по клику вне его и по клавише Esc
  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        className="user"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="avatar">
          {profile?.photo ? <img src={profile.photo} alt="" /> : getInitials(user.fullName)}
        </span>
        <span className="user__name">{shortName(user.fullName)}</span>
        <ChevronDown size={16} className={open ? "user__chevron user__chevron--open" : "user__chevron"} />
      </button>

      {open && (
        <div className="dropdown" role="menu">
          <div className="dropdown__who">
            <b>{user.fullName}</b>
            <span>
              {ROLE_LABELS[user.role]} · {user.email}
            </span>
          </div>

          <nav className="nav">
            {MENU[user.role].map(({ icon: Icon, label, to }) => {
              const content = (
                <>
                  <Icon size={19} strokeWidth={1.9} />
                  <span>{label}</span>
                </>
              );

              return to ? (
                <NavLink
                  key={label}
                  to={to}
                  end
                  role="menuitem"
                  className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
                >
                  {content}
                </NavLink>
              ) : (
                <a key={label} href="#" role="menuitem" className="nav__link" onClick={() => setOpen(false)}>
                  {content}
                </a>
              );
            })}
            <button type="button" role="menuitem" className="nav__link nav__link--logout" onClick={logout}>
              <LogOut size={19} strokeWidth={1.9} />
              <span>Выйти</span>
            </button>
          </nav>

          {user.role === "student" && (
            <a href="#" className="dropdown__promo" onClick={() => setOpen(false)}>
              <span className="dropdown__promo-star">✦</span>
              <span className="dropdown__promo-text">
                <b>Твой путь к практике</b>
                начинается здесь
              </span>
              <span className="dropdown__promo-btn">
                <ArrowRight size={16} />
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
