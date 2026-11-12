import { Award, Briefcase, Code2, FileText, Star, type LucideIcon } from "lucide-react";
import type { Badge } from "../data/profile";

// Иконки значков — общие для главной и профиля
export const badgeIcons: Record<Badge["icon"], LucideIcon> = {
  star: Star,
  file: FileText,
  code: Code2,
  briefcase: Briefcase,
  award: Award,
};
