import type { Stat } from "../data/mock";

type StatsProps = {
  items: Stat[];
};

export function Stats({ items }: StatsProps) {
  return (
    <section className="stats">
      {items.map((stat) => (
        <div className="stat" key={stat.label}>
          <span className="stat__icon">{stat.icon}</span>
          <div>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
