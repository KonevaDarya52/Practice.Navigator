type NavItem = {
  icon: string;
  label: string;
  active?: boolean;
};

const navItems: NavItem[] = [
  { icon: "⌂", label: "Главная", active: true },
  { icon: "♙", label: "Мой профиль" },
  { icon: "⌕", label: "Подбор практики" },
  { icon: "▤", label: "Мои отклики" },
  { icon: "♤", label: "Уведомления" },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside className={open ? "sidebar sidebar--open" : "sidebar"}>
        <a href="/" className="brand">
          <span className="brand__mark">✧</span>
          <span className="brand__name">
            Practice.
            <br />
            Navigator
            <small>Synapse · TIU</small>
          </span>
        </a>

        <p className="nav-label">Рабочее пространство</p>
        <nav className="nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={item.active ? "nav__link nav__link--active" : "nav__link"}
              onClick={onClose}
            >
              <span className="nav__icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__spark">✦</div>
          Твой путь к практике
          <br />
          начинается здесь.
          <br />
          <span className="sidebar__copy">Practice.Navigator · 2026</span>
        </div>
      </aside>

      {/* Затемнение фона при открытом меню на телефоне */}
      {open && <div className="overlay" onClick={onClose} />}
    </>
  );
}
