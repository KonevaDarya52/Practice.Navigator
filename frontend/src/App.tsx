import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { useTheme } from "./hooks/useTheme";
import { HomePage } from "./pages/HomePage";

export function App() {
  const { theme, toggleTheme } = useTheme();
  // Открыто ли боковое меню на телефоне
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Topbar theme={theme} onToggleTheme={toggleTheme} onMenuClick={() => setMenuOpen(true)} />
        <HomePage />
      </div>
    </>
  );
}
