import { Link } from "react-router-dom";

// Логотип: четырёхконечная звезда-компас и название сервиса
export function Logo() {
  return (
    <Link to="/" className="logo">
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="logo-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9d6ff" />
            <stop offset="1" stopColor="#6f8cff" />
          </linearGradient>
          <linearGradient id="logo-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f6df5" />
            <stop offset="1" stopColor="#1e3393" />
          </linearGradient>
        </defs>
        {/* Каждый луч из двух граней — светлой и тёмной, чтобы звезда выглядела объёмной */}
        <path d="M20 2 L23 17 L20 20 Z" fill="url(#logo-light)" />
        <path d="M20 2 L17 17 L20 20 Z" fill="url(#logo-dark)" />
        <path d="M38 20 L23 23 L20 20 Z" fill="url(#logo-dark)" />
        <path d="M38 20 L23 17 L20 20 Z" fill="url(#logo-light)" />
        <path d="M20 38 L17 23 L20 20 Z" fill="url(#logo-light)" />
        <path d="M20 38 L23 23 L20 20 Z" fill="url(#logo-dark)" />
        <path d="M2 20 L17 17 L20 20 Z" fill="url(#logo-dark)" />
        <path d="M2 20 L17 23 L20 20 Z" fill="url(#logo-light)" />
      </svg>
      <span className="logo__name">
        Practice.
        <br />
        Navigator
        <small>Synapse · TIU</small>
      </span>
    </Link>
  );
}
