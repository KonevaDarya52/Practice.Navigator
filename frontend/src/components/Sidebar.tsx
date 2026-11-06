import { ArrowRight, Bell, Home, Inbox, Search, User, type LucideIcon } from "lucide-react";
import { currentUser } from "../data/mock";
import { Logo } from "./Logo";

type NavItem = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
};

const navItems: NavItem[] = [
  { icon: Home, label: "Главная", active: true },
  { icon: User, label: "Мой профиль" },
  { icon: Search, label: "Подбор практики" },
  { icon: Inbox, label: "Мои отклики" },
  { icon: Bell, label: "Уведомления", badge: currentUser.unreadNotifications },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside className={open ? "sidebar sidebar--open" : "sidebar"}>
        <Logo />

        <nav className="nav">
          {navItems.map(({ icon: Icon, label, active, badge }) => (
            <a
              key={label}
              href="#"
              className={active ? "nav__link nav__link--active" : "nav__link"}
              onClick={onClose}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
              {badge ? <span className="nav__badge">{badge}</span> : null}
            </a>
          ))}
        </nav>

        <a href="#" className="sidebar__promo">
          <span className="sidebar__promo-star">✦</span>
          <span className="sidebar__promo-text">
            <b>Твой путь к практике</b>
            начинается здесь
          </span>
          <span className="sidebar__promo-btn">
            <ArrowRight size={16} />
          </span>
        </a>
      </aside>

      {/* Затемнение фона при открытом меню на телефоне */}
      {open && <div className="overlay" onClick={onClose} />}
    </>
  );
}
