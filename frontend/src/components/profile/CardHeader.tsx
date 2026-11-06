import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type CardHeaderProps = {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
};

// Заголовок карточки профиля: иконка, название и действие справа
export function CardHeader({ icon: Icon, title, action }: CardHeaderProps) {
  return (
    <div className="card-header">
      <Icon size={20} className="card-header__icon" />
      <h3>{title}</h3>
      {action && <div className="card-header__action">{action}</div>}
    </div>
  );
}
