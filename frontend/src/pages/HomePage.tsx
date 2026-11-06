import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../api/client";
import type { PracticeRequest } from "../api/types";
import { CareerCard } from "../components/CareerCard";
import { Hero } from "../components/Hero";
import { ProfileCard } from "../components/ProfileCard";
import { RequestCard } from "../components/RequestCard";
import { Stats } from "../components/Stats";
import { Stepper } from "../components/Stepper";
import { useProfile } from "../context/ProfileContext";
import { getStats, heroSlides, profileSummary, steps } from "../data/mock";
import { skillMatch } from "../lib/match";

export function HomePage() {
  const { profile, completion } = useProfile();
  const [requests, setRequests] = useState<PracticeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Опубликованные заявки с сервера
  useEffect(() => {
    api<PracticeRequest[]>("GET", "/requests")
      .then(setRequests)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Сначала самые подходящие по навыкам
  const sorted = requests
    .map((request) => ({ request, match: skillMatch(request, profile) }))
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0));

  return (
    <main className="page">
      <div className="home">
        <div className="home__main">
          <Hero slides={heroSlides} />
          <Stats items={getStats(completion, requests.length)} />

          <section>
            <div className="section-head">
              <h2>Подходящие практики</h2>
              <a href="#" className="chip-link">
                Все предложения <ArrowRight size={13} />
              </a>
            </div>
            <div className="request-list">
              {loading && <div className="card page-state">Загружаю заявки…</div>}
              {error && <div className="card page-state">Не удалось загрузить заявки: {error}</div>}
              {!loading && !error && sorted.length === 0 && (
                <div className="card page-state">Опубликованных заявок пока нет</div>
              )}
              {sorted.map(({ request, match }) => (
                <RequestCard key={request.id} request={request} match={match} />
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
            completion={completion}
            badges={profileSummary.badges}
            badgesTotal={profileSummary.badgesTotal}
          />
          <CareerCard />
        </aside>
      </div>
    </main>
  );
}
