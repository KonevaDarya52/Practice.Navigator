import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, apiBlob } from "../api/client";
import type { Badge, ProfileData } from "../data/profile";
import { getCompletion, initials, shortName } from "../lib/profile";
import { getBadges } from "../lib/progress";
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
  badges: Badge[]; // все значки; earned — получен ли (считается по профилю)
  saveProfile: (profile: ProfileData) => Promise<void>; // бросает ApiError, если сервер не принял
  // Резюме загружается и удаляется сразу, без кнопки «Сохранить». Возвращают новое имя файла
  uploadResume: (file: File) => Promise<string>;
  deleteResume: () => Promise<string>;
  openResume: () => Promise<void>;
  updateSettings: (patch: ProfileSettings) => Promise<void>; // сохраняет переключатель сразу
};

export type ProfileSettings = Partial<Pick<ProfileData, "notificationsEnabled" | "contactsAfterResponse">>;

// Ограничения для резюме — те же, что проверяет backend (MAX_RESUME_BYTES)
export const RESUME_MAX_MB = 5;
export const RESUME_MAX_BYTES = RESUME_MAX_MB * 1024 * 1024;

// Проверка до отправки: вернёт текст ошибки или пустую строку
export function checkResumeFile(file: File): string {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Можно загрузить только PDF. Сохрани резюме в PDF и попробуй ещё раз";
  if (file.size > RESUME_MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
    return `Файл весит ${mb} МБ — максимум ${RESUME_MAX_MB} МБ`;
  }
  if (file.size === 0) return "Файл пустой";
  return "";
}

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

  // Сервер возвращает весь профиль — берём из него только имя резюме,
  // чтобы не затереть другие поля, которые сейчас редактируются
  const applyResume = (saved: ProfileData) => {
    setProfile((p) => (p ? { ...p, resume: saved.resume } : saved));
    return saved.resume;
  };

  const uploadResume = useCallback(async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return applyResume(await api<ProfileData>("POST", "/profile/me/resume", form));
  }, []);

  const deleteResume = useCallback(async () => applyResume(await api<ProfileData>("DELETE", "/profile/me/resume")), []);

  const openResume = useCallback(async () => {
    // Окно открываем сразу (иначе браузер заблокирует всплывающее окно), PDF подставляем после загрузки
    const tab = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await apiBlob("/profile/me/resume"));
      if (tab) tab.location.href = url;
      else window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      tab?.close();
      throw e;
    }
  }, []);

  // Переключатель меняем сразу (чтобы не было задержки), а если сервер не принял — возвращаем как было
  const updateSettings = useCallback(async (patch: ProfileSettings) => {
    let before: ProfileData | null = null;
    setProfile((p) => {
      before = p;
      return p ? { ...p, ...patch } : p;
    });
    try {
      const saved = await api<ProfileData>("PATCH", "/profile/me/settings", patch);
      setProfile((p) => (p ? { ...p, notificationsEnabled: saved.notificationsEnabled, contactsAfterResponse: saved.contactsAfterResponse } : p));
    } catch (e) {
      setProfile(before);
      throw e;
    }
  }, []);

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
      badges: profile ? getBadges(profile, percent) : [],
      saveProfile,
      uploadResume,
      deleteResume,
      openResume,
      updateSettings,
    };
  }, [profile, loading, error, user?.fullName, saveProfile, uploadResume, deleteResume, openResume, updateSettings]);

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
