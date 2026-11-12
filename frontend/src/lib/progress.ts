import type { Badge, ProfileData, ReadinessPart } from "../data/profile";

// Всё, что здесь считается, берётся только из данных профиля — без выдуманных чисел.

const filled = (value: string) => value.trim().length > 0;
const share = (count: number, target: number) => Math.min(100, Math.round((count / target) * 100));

// ----- Значки: выдаются за конкретные действия в профиле -----

type BadgeRule = Omit<Badge, "earned"> & { earned: (p: ProfileData, completion: number) => boolean };

const BADGE_RULES: BadgeRule[] = [
  { icon: "star", title: "Профиль заполнен", hint: "Заполни профиль на 100%", earned: (_, completion) => completion === 100 },
  { icon: "file", title: "Резюме загружено", hint: "Загрузи резюме в PDF", earned: (p) => filled(p.resume) },
  { icon: "code", title: "5 навыков", hint: "Добавь 5 технических навыков", earned: (p) => p.technicalSkills.length >= 5 },
  { icon: "briefcase", title: "Есть опыт", hint: "Добавь практику или активность", earned: (p) => p.experience.length > 0 },
  { icon: "award", title: "Первое достижение", hint: "Добавь сертификат, курс, проект или доклад", earned: (p) => p.achievements.length > 0 },
];

export function getBadges(profile: ProfileData, completion: number): Badge[] {
  return BADGE_RULES.map(({ earned, ...badge }) => ({ ...badge, earned: earned(profile, completion) }));
}

// ----- Готовность к подбору: веса из презентации, заполненность — из профиля -----

export function getReadiness(p: ProfileData): { score: number; parts: ReadinessPart[] } {
  const parts: ReadinessPart[] = [
    {
      title: "Навыки",
      weight: 50,
      filled: share(p.technicalSkills.length + p.programmingLanguages.length, 5),
      detail: `${p.technicalSkills.length + p.programmingLanguages.length} из 5`,
    },
    {
      title: "Языки",
      weight: 15,
      filled: share(p.foreignLanguages.length, 1),
      detail: `${p.foreignLanguages.length} из 1`,
    },
    {
      title: "Опыт: практики, доклады",
      weight: 15,
      filled: share(p.experience.length + p.achievements.length, 3),
      detail: `${p.experience.length + p.achievements.length} из 3`,
    },
    {
      title: "Формат, город, оплата",
      weight: 10,
      filled: share([p.format, p.preferredCity, p.payment].filter(filled).length, 3),
      detail: `${[p.format, p.preferredCity, p.payment].filter(filled).length} из 3`,
    },
    {
      title: "Интересы",
      weight: 10,
      filled: share(p.interests.length, 3),
      detail: `${p.interests.length} из 3`,
    },
  ];
  const score = Math.round(parts.reduce((sum, part) => sum + (part.weight * part.filled) / 100, 0));
  return { score, parts };
}
