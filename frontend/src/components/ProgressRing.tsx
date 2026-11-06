import { useId } from "react";

type ProgressRingProps = {
  value: number; // 0–100
  size?: number;
};

// Кольцо прогресса с процентом в центре
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ value, size = 92 }: ProgressRingProps) {
  // Уникальный id градиента, чтобы несколько колец на странице не мешали друг другу
  const gradientId = useId();

  return (
    <svg className="ring" viewBox="0 0 80 80" width={size} height={size} role="img" aria-label={`${value}%`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--accent-light)" }} />
          <stop offset="1" style={{ stopColor: "var(--accent)" }} />
        </linearGradient>
      </defs>
      <circle className="ring__track" cx="40" cy="40" r={RADIUS} />
      <circle
        className="ring__value"
        cx="40"
        cy="40"
        r={RADIUS}
        stroke={`url(#${gradientId})`}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - value / 100)}
      />
      <text x="40" y="46" textAnchor="middle" className="ring__text">
        {value}%
      </text>
    </svg>
  );
}
