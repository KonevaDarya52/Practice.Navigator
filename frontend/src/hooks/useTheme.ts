import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "pn-theme";

// Тёмная тема — по умолчанию. Выбор пользователя запоминается в браузере.
function readSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage может быть недоступен (например, в приватном режиме)
  }
  return "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // не страшно, тема просто не запомнится
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
