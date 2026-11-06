import { useEffect, useRef } from "react";

// Звёздное небо на весь экран (рисуется на canvas).
// Звёзды на трёх «глубинах»: близкие сильнее смещаются вслед за мышкой — получается эффект объёма.
// Каждая звезда мерцает. Если в системе включено «уменьшить движение», небо неподвижно.

type Star = {
  x: number; // 0..1 от ширины экрана
  y: number; // 0..1 от высоты
  depth: number; // 0.2 (далеко) .. 1 (близко)
  size: number;
  phase: number; // сдвиг мерцания
  speed: number; // скорость мерцания
  sparkle: boolean; // крупные — четырёхконечные, мелкие — точки
};

const MAX_SHIFT = 46; // на сколько пикселей смещаются самые близкие звёзды
const MARGIN = 60; // звёзды рисуются и чуть за краем экрана, чтобы при сдвиге не было пустых полос

function createStars(width: number, height: number): Star[] {
  const count = Math.min(240, Math.round((width * height) / 8000));
  return Array.from({ length: count }, () => {
    const depth = 0.2 + Math.random() * 0.8;
    const sparkle = Math.random() < 0.18;
    return {
      x: Math.random(),
      y: Math.random(),
      depth,
      size: sparkle ? 3 + depth * 5 : 0.6 + depth * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.6,
      sparkle,
    };
  });
}

// Четырёхконечная звёздочка: вогнутые стороны через кривые
function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const k = r * 0.22;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + k, y - k, x + r, y);
  ctx.quadraticCurveTo(x + k, y + k, x, y + r);
  ctx.quadraticCurveTo(x - k, y + k, x - r, y);
  ctx.quadraticCurveTo(x - k, y - k, x, y - r);
  ctx.fill();
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let color = "#8ea6ff";

    // Цвет звёзд берём из темы: светлые на тёмном фоне, синие на светлом
    const readColor = () => {
      const styles = getComputedStyle(document.documentElement);
      const light = document.documentElement.dataset.theme === "light";
      color = styles.getPropertyValue(light ? "--accent" : "--accent-light").trim() || color;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(width, height);
    };

    // Положение мышки: от -0.5 до 0.5 относительно центра экрана. Текущее значение плавно догоняет целевое
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX / width - 0.5;
      target.y = e.clientY / height - 0.5;
    };

    let frame = 0;
    const draw = (time: number) => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (const star of stars) {
        // Звёзды тянутся в сторону мышки: чем ближе звезда, тем сильнее
        const shiftX = current.x * MAX_SHIFT * 2 * star.depth;
        const shiftY = current.y * MAX_SHIFT * 2 * star.depth;
        const x = star.x * (width + MARGIN * 2) - MARGIN + shiftX;
        const y = star.y * (height + MARGIN * 2) - MARGIN + shiftY;

        const twinkle = reduceMotion ? 0.75 : 0.55 + 0.45 * Math.sin((time / 1000) * star.speed + star.phase);
        ctx.globalAlpha = (0.25 + star.depth * 0.75) * twinkle;

        if (star.sparkle) {
          drawSparkle(ctx, x, y, star.size);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    // Перерисовываем цвет, когда пользователь переключает тему
    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    readColor();
    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) window.addEventListener("mousemove", onMouseMove);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" aria-hidden="true" />;
}
