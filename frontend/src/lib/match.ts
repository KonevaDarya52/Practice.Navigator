import type { PracticeRequest } from "../api/types";
import type { ProfileData } from "../data/profile";

// Предварительный процент совпадения по навыкам: обязательные навыки дают 70%, желательные — 30%.
// Полный подбор с весами из презентации (навыки, языки, опыт, формат, интересы) — задача спринта 3.
export function skillMatch(request: PracticeRequest, profile: ProfileData | null): number | null {
  if (!profile) return null;
  const mine = new Set(profile.technicalSkills.map((s) => s.name.toLowerCase()));
  const share = (skills: string[]) =>
    skills.length === 0 ? 1 : skills.filter((s) => mine.has(s.toLowerCase())).length / skills.length;
  return Math.round(share(request.requiredSkills) * 70 + share(request.desiredSkills) * 30);
}
