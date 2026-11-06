// Объёмная звезда-компас с орбитами для главного блока.
// Каждый луч состоит из двух треугольников: светлой и тёмной грани.

const CX = 300;
const CY = 150;

type Arm = { angle: number; length: number; width: number };

const mainArms: Arm[] = [0, 90, 180, 270].map((angle) => ({
  angle,
  length: angle % 180 === 0 ? 112 : 130,
  width: 20,
}));

const smallArms: Arm[] = [45, 135, 225, 315].map((angle) => ({ angle, length: 52, width: 9 }));

function point(angleDeg: number, distance: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  return `${CX + Math.cos(rad) * distance},${CY + Math.sin(rad) * distance}`;
}

function facets({ angle, length, width }: Arm) {
  const tip = point(angle, length);
  const left = point(angle - 90, width);
  const right = point(angle + 90, width);
  const center = `${CX},${CY}`;
  return {
    light: `M${center} L${tip} L${left} Z`,
    dark: `M${center} L${tip} L${right} Z`,
  };
}

export function HeroStar() {
  return (
    <svg className="hero-star" viewBox="0 0 480 300" aria-hidden="true">
      <defs>
        <radialGradient id="star-glow">
          <stop offset="0" style={{ stopColor: "var(--star-glow)", stopOpacity: 0.85 }} />
          <stop offset="1" style={{ stopColor: "var(--star-glow)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="star-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9fb4ff" />
        </linearGradient>
        <linearGradient id="star-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a78ff" />
          <stop offset="1" stopColor="#1c2f8f" />
        </linearGradient>
      </defs>

      {/* Свечение за звездой */}
      <circle cx={CX} cy={CY} r="140" fill="url(#star-glow)" />

      {/* Орбиты */}
      <g className="hero-star__orbits" fill="none">
        <ellipse cx={CX} cy={CY + 10} rx="230" ry="62" transform={`rotate(-18 ${CX} ${CY})`} />
        <ellipse cx={CX - 20} cy={CY + 30} rx="260" ry="95" transform={`rotate(-28 ${CX} ${CY})`} />
      </g>
      <circle cx="140" cy="88" r="3" className="hero-star__spark" />
      <circle cx="420" cy="60" r="2" className="hero-star__spark" />

      {[...smallArms, ...mainArms].map((arm) => {
        const { light, dark } = facets(arm);
        return (
          <g key={arm.angle}>
            <path d={light} fill="url(#star-light)" />
            <path d={dark} fill="url(#star-dark)" />
          </g>
        );
      })}
    </svg>
  );
}
