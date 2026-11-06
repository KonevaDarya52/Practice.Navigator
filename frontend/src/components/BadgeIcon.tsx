import { Briefcase, Rocket, Star, type LucideIcon } from "lucide-react";
import type { Badge } from "../data/profile";

// Иконки значков — общие для главной и профиля
export const badgeIcons: Record<Badge["icon"], LucideIcon> = {
  star: Star,
  briefcase: Briefcase,
  rocket: Rocket,
};
