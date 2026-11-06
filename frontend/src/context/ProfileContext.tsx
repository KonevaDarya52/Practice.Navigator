import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultProfile, type ProfileData } from "../data/profile";
import { getCompletion, initials, shortName } from "../lib/profile";

// Пока нет backend, профиль хранится в браузере.
// Потом здесь будут запросы к API: загрузка профиля и его сохранение.
const STORAGE_KEY = "pn-profile";

function loadProfile(): ProfileData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Подмешиваем к тестовым данным, чтобы новые поля не пропадали у старых сохранений
    if (saved) return { ...defaultProfile, ...JSON.parse(saved) };
  } catch {
    // повреждённые или недоступные данные — начинаем с тестовых
  }
  return defaultProfile;
}

type ProfileContextValue = {
  profile: ProfileData;
  displayName: string;
  initials: string;
  completion: number;
  missing: string[];
  saveProfile: (profile: ProfileData) => void;
  resetProfile: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // не удалось сохранить (например, приватный режим) — данные живут до перезагрузки
    }
  }, [profile]);

  const value = useMemo<ProfileContextValue>(() => {
    const { percent, missing } = getCompletion(profile);
    return {
      profile,
      displayName: shortName(profile.fullName),
      initials: initials(profile.fullName),
      completion: percent,
      missing,
      saveProfile: setProfile,
      resetProfile: () => setProfile(defaultProfile),
    };
  }, [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile нужно использовать внутри ProfileProvider");
  return context;
}
