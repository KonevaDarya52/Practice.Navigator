import { currentUser } from "../data/mock";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="menu-btn" aria-label="Открыть меню" onClick={onMenuClick}>
          ☰
        </button>
        <span className="chip">● {currentUser.role}</span>
        <span className="chip chip--plain uni">♜ {currentUser.university}</span>
      </div>
      <div className="topbar__right">
        <a href="#" className="chip">
          ♤ Уведомления
        </a>
        <span className="avatar">{currentUser.name[0]}</span>
        <span className="user-name">{currentUser.name}</span>
      </div>
    </header>
  );
}
