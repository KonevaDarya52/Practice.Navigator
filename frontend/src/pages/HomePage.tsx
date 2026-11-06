import { Hero } from "../components/Hero";
import { ProfileCard } from "../components/ProfileCard";
import { RequestCard } from "../components/RequestCard";
import { Stats } from "../components/Stats";
import { Stepper } from "../components/Stepper";
import { TipCard } from "../components/TipCard";
import { profile, requests, stats, steps } from "../data/mock";

export function HomePage() {
  return (
    <main className="page">
      <Hero />
      <Stats items={stats} />

      <div className="grid-2">
        <section>
          <div className="section-head">
            <div>
              <h2>Подходящие практики</h2>
              <p>Подборка рассчитана по параметрам твоего профиля</p>
            </div>
            <a href="#" className="btn btn--soft btn--sm">
              Все предложения →
            </a>
          </div>

          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </section>

        <aside>
          <ProfileCard completion={profile.completion} items={profile.items} />
          <TipCard />
        </aside>
      </div>

      <section>
        <div className="section-head">
          <div>
            <h2>Как проходит распределение</h2>
            <p>От заявки компании до закрепления за местом практики</p>
          </div>
        </div>

        <div className="card">
          <Stepper steps={steps} />
          <p className="muted">
            После принятия предложения остальные отклики закрываются. Вуз подтверждает
            закрепление, после чего данные могут быть выгружены для приказа.
          </p>
        </div>
      </section>

      <p className="footer-note">Practice.Navigator · проект Synapse · демонстрационный прототип.</p>
    </main>
  );
}
