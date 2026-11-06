import { Briefcase, FileText, Send, Star, TrendingUp, type LucideIcon } from "lucide-react";
import type { Stat, StatIcon } from "../data/mock";

const icons: Record<StatIcon, LucideIcon> = {
  briefcase: Briefcase,
  file: FileText,
  send: Send,
  star: Star,
};

type StatsProps = {
  items: Stat[];
};

export function Stats({ items }: StatsProps) {
  return (
    <section className="stats">
      {items.map((stat) => {
        const Icon = icons[stat.icon];
        return (
          <div className="stat" key={stat.label}>
            <span className="stat__icon">
              <Icon size={22} strokeWidth={2} />
            </span>
            <div className="stat__body">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
            {stat.trend && <TrendingUp className="stat__trend" size={18} />}
          </div>
        );
      })}
    </section>
  );
}
