import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Topbar } from "./components/Topbar";
import { useTheme } from "./hooks/useTheme";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // При переходе на другую страницу прокручиваем наверх
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Topbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}
