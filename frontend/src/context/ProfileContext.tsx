import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { ProfileData } from "../data/profile";
import { getCompletion, initials, shortName } from "../lib/profile";
import { useAuth } from "./AuthContext";

// Профиль студента: загружается с сервера и сохраняется на сервер (GET/PUT /api/v1/profile/me)

type ProfileContextValue = {
  profile: ProfileData | null; // null — профиль ещё грузится или пользователь не студент
  loading: boolean;
  error: string;
  displayName: string;
  initials: string;
  completion: number;
  missing: string[];
  saveProfile: (profile: ProfileData) => Promise<void>; // бросает ApiError, если сервер не принял
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isStudent = user?.role === "student";

  useEffect(() => {
    if (!isStudent) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError("");
    api<ProfileData>("GET", "/profile/me")
      .then(setProfile)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isStudent, user?.id]);

  const saveProfile = useCallback(
    async (data: ProfileData) => {
      const saved = await api<ProfileData>("PUT", "/profile/me", data);
      setProfile(saved);
      // ФИО и почта хранятся у пользователя — обновляем шапку
      await refreshUser();
    },
    [refreshUser],
  );

  const value = useMemo<ProfileContextValue>(() => {
    const name = profile?.fullName ?? user?.fullName ?? "";
    const { percent, missing } = profile ? getCompletion(profile) : { percent: 0, missing: [] };
    return {
      profile,
      loading,
      error,
      displayName: shortName(name),
      initials: initials(name),
      completion: percent,
      missing,
      saveProfile,
    };
  }, [profile, loading, error, user?.fullName, saveProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile нужно использовать внутри ProfileProvider");
  return context;
}

// Для карточек профиля: их показывают только когда профиль уже загружен
export function useLoadedProfile() {
  const context = useProfile();
  if (!context.profile) throw new Error("Профиль ещё не загружен");
  return { ...context, profile: context.profile };
}
