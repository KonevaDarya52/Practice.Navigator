import { Rocket } from "lucide-react";

export function CareerCard() {
  return (
    <a href="#" className="card career-card">
      {/* Волна на фоне */}
      <svg className="career-card__wave" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="wave-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 0.9 }} />
          </linearGradient>
        </defs>
        <path d="M0 160 C 90 150, 170 120, 220 70 S 280 10, 300 0 L 300 160 Z" fill="url(#wave-gradient)" />
        <path d="M0 150 C 100 140, 180 100, 230 55 S 285 5, 300 -5" fill="none" style={{ stroke: "var(--accent-light)", strokeOpacity: 0.5 }} />
      </svg>

      <Rocket className="career-card__rocket" size={44} strokeWidth={1.4} />
      <span className="career-card__star">✦</span>
      <p className="career-card__text">
        Твой карьерный путь
        <br />
        начинается сейчас
      </p>
    </a>
  );
}
