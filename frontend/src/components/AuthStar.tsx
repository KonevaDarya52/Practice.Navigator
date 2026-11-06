import { useEffect, useRef } from "react";

// Объёмная звезда-кристалл для страницы входа.
// Это настоящая 3D-модель: у каждого луча четыре грани (пирамида), модель вращается,
// а цвет каждой грани считается по освещению — рассеянный свет + блик (модель Фонга).
// Рисуется на обычном canvas без сторонних библиотек.

type Vec = [number, number, number];
type Face = { a: Vec; b: Vec; c: Vec };

const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const dot = (p: Vec, q: Vec) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const cross = (p: Vec, q: Vec): Vec => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
const norm = (p: Vec): Vec => {
  const len = Math.hypot(p[0], p[1], p[2]) || 1;
  return [p[0] / len, p[1] / len, p[2] / len];
};

// ----- Модель звезды (единицы условные, центр в нуле) -----

// Луч — пирамида: вершина на конце луча, основание — ромб вокруг центра
function arm(angleDeg: number, length: number, width: number, depth: number): Face[] {
  const a = (angleDeg * Math.PI) / 180;
  const dir: Vec = [Math.cos(a), Math.sin(a), 0];
  const side: Vec = [-dir[1], dir[0], 0];
  const tip: Vec = [dir[0] * length, dir[1] * length, 0];
  const left: Vec = [side[0] * width, side[1] * width, 0];
  const right: Vec = [-side[0] * width, -side[1] * width, 0];
  const front: Vec = [0, 0, depth];
  const back: Vec = [0, 0, -depth];
  return [
    { a: tip, b: left, c: front },
    { a: tip, b: front, c: right },
    { a: tip, b: right, c: back },
    { a: tip, b: back, c: left },
  ];
}

const FACES: Face[] = [
  // Маленькие диагональные лучи
  ...[45, 135, 225, 315].flatMap((angle) => arm(angle, 0.42, 0.075, 0.07)),
  // Четыре главных луча: вертикальные длиннее
  ...[0, 180].flatMap((angle) => arm(angle, 0.86, 0.17, 0.17)),
  ...[90, 270].flatMap((angle) => arm(angle, 1.05, 0.17, 0.17)),
];

// ----- Свет и цвета -----

const LIGHT = norm([-0.55, -0.75, 0.9]); // свет слева сверху и спереди (ось y смотрит вниз)
const VIEW: Vec = [0, 0, 1];
const HALF = norm([LIGHT[0] + VIEW[0], LIGHT[1] + VIEW[1], LIGHT[2] + VIEW[2]]);

// Палитра от тени к свету: глубокий синий → синий → почти белый
const PALETTE: Vec[] = [
  [14, 24, 92],
  [44, 72, 214],
  [120, 150, 255],
  [236, 241, 255],
];

function shade(t: number): Vec {
  const x = Math.max(0, Math.min(0.999, t)) * (PALETTE.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const p = PALETTE[i];
  const q = PALETTE[i + 1];
  return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
}

const rgb = (c: Vec, boost = 0) =>
  `rgb(${Math.min(255, c[0] + boost) | 0},${Math.min(255, c[1] + boost) | 0},${Math.min(255, c[2] + boost) | 0})`;

// Поворот точки: сначала вокруг вертикали (yaw), потом вокруг горизонтали (pitch), потом наклон (roll)
function rotate(p: Vec, yaw: number, pitch: number, roll: number): Vec {
  let [x, y, z] = p;
  [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
  [y, z] = [y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)];
  [x, y] = [x * Math.cos(roll) - y * Math.sin(roll), x * Math.sin(roll) + y * Math.cos(roll)];
  return [x, y, z];
}

export function AuthStar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let size = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let frame = 0;
    const draw = (time: number) => {
      const t = time / 1000;
      // Большие плавные повороты: до ±50° по горизонтали и ±25° по вертикали.
      // Больше не стоит: лучи встают ребром, и звезда превращается в линию
      const yaw = reduceMotion ? -0.45 : Math.sin(t * 0.42) * 0.87;
      const pitch = reduceMotion ? 0.25 : Math.sin(t * 0.31 + 1) * 0.42;
      const roll = reduceMotion ? 0.05 : Math.sin(t * 0.2) * 0.12;
      const float = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.025;

      const scale = size * 0.46;
      const cx = size / 2;
      const cy = size / 2 + float * size;
      const focal = 4; // перспектива: чем меньше, тем сильнее

      const project = (p: Vec): [number, number] => {
        const k = focal / (focal - p[2]);
        return [cx + p[0] * scale * k, cy + p[1] * scale * k];
      };

      // Поворачиваем грани, считаем освещение, отбрасываем задние
      const visible = [];
      for (const face of FACES) {
        const a = rotate(face.a, yaw, pitch, roll);
        const b = rotate(face.b, yaw, pitch, roll);
        const c = rotate(face.c, yaw, pitch, roll);
        let n = norm(cross(sub(b, a), sub(c, a)));
        const center: Vec = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
        // Нормаль должна смотреть наружу, от центра звезды
        if (dot(n, center) < 0) n = [-n[0], -n[1], -n[2]];
        if (n[2] <= 0.01) continue; // грань отвёрнута от зрителя

        const diffuse = Math.max(0, dot(n, LIGHT));
        const specular = Math.pow(Math.max(0, dot(n, HALF)), 28);
        visible.push({ a, b, c, z: center[2], light: 0.12 + diffuse * 0.8, specular });
      }

      // Сначала рисуем дальние грани, потом ближние
      visible.sort((p, q) => p.z - q.z);

      ctx.clearRect(0, 0, size, size);
      ctx.lineJoin = "round";

      for (const f of visible) {
        const [ax, ay] = project(f.a);
        const [bx, by] = project(f.b);
        const [cx2, cy2] = project(f.c);

        // Грань светлее у центра звезды и темнее к концу луча — так грань выглядит гранёной, а не плоской
        const base = shade(f.light);
        const tipColor = shade(f.light * 0.72);
        const midX = (bx + cx2) / 2;
        const midY = (by + cy2) / 2;
        const gradient = ctx.createLinearGradient(ax, ay, midX, midY);
        gradient.addColorStop(0, rgb(tipColor));
        gradient.addColorStop(1, rgb(base, f.specular * 140));

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx2, cy2);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        // Тонкое светлое ребро
        ctx.strokeStyle = `rgba(220, 230, 255, ${0.12 + f.specular * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Блик в центре, где сходятся грани
      ctx.globalCompositeOperation = "lighter";
      const glare = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.09);
      glare.addColorStop(0, "rgba(255,255,255,0.85)");
      glare.addColorStop(0.4, "rgba(170,190,255,0.35)");
      glare.addColorStop(1, "rgba(120,150,255,0)");
      ctx.fillStyle = glare;
      ctx.fillRect(cx - size * 0.1, cy - size * 0.1, size * 0.2, size * 0.2);
      ctx.globalCompositeOperation = "source-over";

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="auth-star" aria-hidden="true">
      <div className="auth-star__glow" />
      <canvas ref={canvasRef} className="auth-star__canvas" />
      <span className="auth-star__spark auth-star__spark--1">✦</span>
      <span className="auth-star__spark auth-star__spark--2">✦</span>
      <span className="auth-star__spark auth-star__spark--3">✦</span>
    </div>
  );
}
