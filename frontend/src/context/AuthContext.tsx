import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "../api/client";
import type { TokenResponse, User } from "../api/types";

export type StudentRegisterData = {
  email: string;
  password: string;
  fullName: string;
};

export type CompanyRegisterData = StudentRegisterData & {
  organizationName: string;
  inn: string;
  contactPhone: string;
  website: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean; // проверяем сохранённый токен при запуске
  login: (email: string, password: string) => Promise<User>;
  registerStudent: (data: StudentRegisterData) => Promise<User>;
  registerCompany: (data: CompanyRegisterData) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await api<User>("GET", "/auth/me"));
  }, []);

  // При запуске: если токен сохранён, узнаём, кто вошёл
  useEffect(() => {
    if (!getToken()) return;
    refreshUser()
      .catch(logout)
      .finally(() => setLoading(false));
  }, [refreshUser, logout]);

  // Сервер ответил 401 (токен истёк) — выходим
  useEffect(() => {
    window.addEventListener("pn-unauthorized", logout);
    return () => window.removeEventListener("pn-unauthorized", logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => {
    const signIn = (response: TokenResponse) => {
      setToken(response.accessToken);
      setUser(response.user);
      return response.user;
    };

    return {
      user,
      loading,
      login: async (email, password) => signIn(await api<TokenResponse>("POST", "/auth/login", { email, password })),
      registerStudent: async (data) => signIn(await api<TokenResponse>("POST", "/auth/register/student", data)),
      registerCompany: async (data) => signIn(await api<TokenResponse>("POST", "/auth/register/company", data)),
      logout,
      refreshUser,
    };
  }, [user, loading, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth нужно использовать внутри AuthProvider");
  return context;
}

// Куда отправить пользователя после входа — у каждой роли свой кабинет
export function homePath(user: User): string {
  if (user.role === "company") return "/company";
  if (user.role === "moderator" || user.role === "admin") return "/moderation";
  return "/";
}
