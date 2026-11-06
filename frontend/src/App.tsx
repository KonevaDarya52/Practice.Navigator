import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { HomePage } from "./pages/HomePage";

export function App() {
  // Открыто ли боковое меню на телефоне
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <HomePage />
      </div>
    </>
  );
}
