import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "../data/mock";
import { HeroStar } from "./HeroStar";

type HeroProps = {
  slides: HeroSlide[];
};

export function Hero({ slides }: HeroProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section className="hero">
      <HeroStar />

      <div className="hero__content">
        <p className="eyebrow">Practice Navigator</p>
        <h1>
          {slide.title} <em>{slide.accent}</em>
        </h1>
        <p className="hero__text">{slide.text}</p>
        <a href="#" className="btn btn--primary">
          {slide.action} <ArrowRight size={16} />
        </a>
      </div>

      <div className="hero__slider">
        <span>
          {index + 1} / {slides.length}
        </span>
        <button className="slider-btn" onClick={prev} aria-label="Предыдущий слайд">
          <ChevronLeft size={16} />
        </button>
        <button className="slider-btn" onClick={next} aria-label="Следующий слайд">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
