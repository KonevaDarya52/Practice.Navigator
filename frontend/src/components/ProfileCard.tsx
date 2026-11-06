import type { ProfileItem } from "../data/mock";

type ProfileCardProps = {
  completion: number;
  items: ProfileItem[];
};

export function ProfileCard({ completion, items }: ProfileCardProps) {
  return (
    <div className="card">
      <h3>Твой профиль</h3>
      <div className="progress-row">
        <b>{completion}% заполнено</b>
        <span className="muted">Ещё немного</span>
      </div>
      <div className="progress">
        <span style={{ width: `${completion}%` }} />
      </div>

      <div className="profile-list">
        {items.map((item) => (
          <div className="profile-item" key={item.label}>
            <b>{item.label}</b>
            <span>{item.value}</span>
          </div>
        ))}
      </div>

      <a href="#" className="btn btn--navy btn--block">
        Продолжить заполнение →
      </a>
    </div>
  );
}
