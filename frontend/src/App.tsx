import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { Role } from "./api/types";
import { Topbar } from "./components/Topbar";
import { homePath, useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import { AuthPage } from "./pages/AuthPage";
import { CompanyPage } from "./pages/CompanyPage";
import { HomePage } from "./pages/HomePage";
import { ModerationPage } from "./pages/ModerationPage";
import { ProfilePage } from "./pages/ProfilePage";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const location = useLocation();

  // При переходе на другую страницу прокручиваем наверх
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Проверяем сохранённый вход
  if (loading) return <div className="page-state page-state--full">Загрузка…</div>;

  // Не вошёл — доступны только вход и регистрация
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/register" element={<AuthPage mode="register" theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Страница доступна только своим ролям, остальных отправляем в их кабинет
  const only = (roles: Role[], page: ReactNode) =>
    roles.includes(user.role) ? page : <Navigate to={homePath(user)} replace />;

  return (
    <>
      <Topbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={only(["student"], <HomePage />)} />
        <Route path="/profile" element={only(["student"], <ProfilePage theme={theme} onToggleTheme={toggleTheme} />)} />
        <Route path="/company" element={only(["company"], <CompanyPage />)} />
        <Route path="/moderation" element={only(["moderator"], <ModerationPage />)} />
        <Route path="*" element={<Navigate to={homePath(user)} replace />} />
      </Routes>
    </>
  );
}
