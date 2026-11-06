import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Home, Inbox, Search, User, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  // Страницы без адреса ещё не сделаны
  to?: string;
};

// Уведомления открываются колокольчиком в шапке, поэтому в меню их нет
const menuItems: MenuItem[] = [
  { icon: Home, label: "Главная", to: "/" },
  { icon: User, label: "Мой профиль", to: "/profile" },
  { icon: Search, label: "Подбор практики" },
  { icon: Inbox, label: "Мои отклики" },
];

// Выпадающее меню под именем пользователя: вся навигация по сервису
export function UserMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { profile, displayName, initials } = useProfile();

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

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        className="user"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="avatar">
          {profile.photo ? <img src={profile.photo} alt="" /> : initials}
        </span>
        <span className="user__name">{displayName}</span>
        <ChevronDown size={16} className={open ? "user__chevron user__chevron--open" : "user__chevron"} />
      </button>

      {open && (
        <div className="dropdown" role="menu">
          <nav className="nav">
            {menuItems.map(({ icon: Icon, label, to }) => {
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
          </nav>

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
        </div>
      )}
    </div>
  );
}
