import { ArrowRight } from "lucide-react";
import { CareerCard } from "../components/CareerCard";
import { Hero } from "../components/Hero";
import { ProfileCard } from "../components/ProfileCard";
import { RequestCard } from "../components/RequestCard";
import { Stats } from "../components/Stats";
import { Stepper } from "../components/Stepper";
import { heroSlides, profile, requests, stats, steps } from "../data/mock";

export function HomePage() {
  return (
    <main className="page">
      <div className="home">
        <div className="home__main">
          <Hero slides={heroSlides} />
          <Stats items={stats} />

          <section>
            <div className="section-head">
              <h2>Подходящие практики</h2>
              <a href="#" className="chip-link">
                Все предложения <ArrowRight size={13} />
              </a>
            </div>
            <div className="request-list">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>Как проходит распределение</h2>
            </div>
            <div className="card">
              <Stepper steps={steps} />
              <p className="muted small">
                После принятия предложения остальные отклики закрываются. Вуз подтверждает
                закрепление, после чего данные могут быть выгружены для приказа.
              </p>
            </div>
          </section>
        </div>

        <aside className="home__side">
          <ProfileCard
            completion={profile.completion}
            achievements={profile.achievements}
            achievementsTotal={profile.achievementsTotal}
          />
          <CareerCard />
        </aside>
      </div>
    </main>
  );
}
