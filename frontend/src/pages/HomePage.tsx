import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { PracticeRequest } from "../api/types";
import { Hero } from "../components/Hero";
import { NextStepCard } from "../components/NextStepCard";
import { ProfileCard } from "../components/ProfileCard";
import { RequestCard } from "../components/RequestCard";
import { RequestDetailsModal } from "../components/RequestDetailsModal";
import { Stats } from "../components/Stats";
import { Stepper } from "../components/Stepper";
import { useProfile } from "../context/ProfileContext";
import { STEP_TITLES, type Stat, type Step } from "../data/mock";
import { plural } from "../lib/format";
import { shortName } from "../lib/profile";
import { skillMatch } from "../lib/match";

const GOOD_MATCH = 70; // с какого процента заявка считается подходящей

type Filter = "all" | "good";

export function HomePage() {
  const { profile, completion, badges, missing } = useProfile();
  const [requests, setRequests] = useState<PracticeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openedId, setOpenedId] = useState<string | null>(null);

  // Опубликованные заявки с сервера
  useEffect(() => {
    api<PracticeRequest[]>("GET", "/requests")
      .then(setRequests)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Навыки студента — чтобы отмечать совпавшие в заявках
  const mySkills = useMemo(
    () => new Set((profile?.technicalSkills ?? []).map((s) => s.name.toLowerCase())),
    [profile?.technicalSkills],
  );

  // Сначала самые подходящие по навыкам
  const sorted = requests
    .map((request) => ({ request, match: skillMatch(request, profile) }))
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
  const good = sorted.filter(({ match }) => (match ?? 0) >= GOOD_MATCH);
  const shown = filter === "good" ? good : sorted;
  const opened = sorted.find(({ request }) => request.id === openedId);

  // Навыки, которых чаще всего не хватает в опубликованных заявках
  const lackingSkills = useMemo(() => {
    const count = new Map<string, number>();
    for (const request of requests) {
      for (const skill of request.requiredSkills) {
        if (!mySkills.has(skill.toLowerCase())) count.set(skill, (count.get(skill) ?? 0) + 1);
      }
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([skill]) => skill);
  }, [requests, mySkills]);

  // Для баннера: каких навыков не хватает именно в тех заявках, что пока не подходят
  const lackingForOthers = useMemo(() => {
    const count = new Map<string, number>();
    for (const { request, match } of sorted) {
      if ((match ?? 0) >= GOOD_MATCH) continue;
      for (const skill of request.requiredSkills) {
        if (!mySkills.has(skill.toLowerCase())) count.set(skill, (count.get(skill) ?? 0) + 1);
      }
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([skill]) => skill);
  }, [sorted, mySkills]);

  // Этап распределения по реальным данным:
  // нет опубликованных заявок — ждём компании (шаг 1); есть — заявки прошли модерацию, идёт подбор (шаг 3).
  // Шаги «Отбор», «Согласие», «Закрепление» зависят от откликов, их в сервисе пока нет
  // Пока заявки грузятся, текущий этап не подсвечиваем (-1), чтобы не мигал шаг 1
  const currentStep = loading ? -1 : requests.length > 0 ? 2 : 0;
  const steps: Step[] = STEP_TITLES.map((title, i) => ({
    title,
    state: i < currentStep ? "done" : i === currentStep ? "current" : "todo",
  }));

  // Что сейчас происходит у студента — подпись под этапами
  const stepNote = loading
    ? ""
    : requests.length === 0
      ? "Сейчас: компании ещё не опубликовали заявки — как только вуз проверит первую, она появится здесь."
      : good.length === 0
        ? `Сейчас: опубликовано ${requests.length} ${plural(requests.length, "заявка", "заявки", "заявок")}, но ни одна не подходит на ${GOOD_MATCH}% и выше — добавь в профиль навыки.`
        : `Сейчас: идёт подбор — ${good.length} ${plural(good.length, "заявка подходит", "заявки подходят", "заявок подходят")} тебе на ${GOOD_MATCH}% и выше.`;

  const skills = profile?.technicalSkills.length ?? 0;
  const stats: Stat[] = [
    { icon: "briefcase", value: `${completion}%`, label: "Заполненность профиля" },
    { icon: "file", value: String(requests.length), label: plural(requests.length, "Актуальная заявка", "Актуальные заявки", "Актуальных заявок") },
    { icon: "star", value: String(good.length), label: `${plural(good.length, "Подходит", "Подходят", "Подходят")} на ${GOOD_MATCH}%+` },
    { icon: "code", value: String(skills), label: plural(skills, "Навык в профиле", "Навыка в профиле", "Навыков в профиле") },
  ];

  return (
    <main className="page">
      <div className="home">
        <div className="home__main">
          <Hero
            firstName={profile ? shortName(profile.fullName).split(" ")[0] : ""}
            loading={loading}
            total={requests.length}
            good={good.length}
            goodThreshold={GOOD_MATCH}
            lackingSkills={lackingForOthers}
            completion={completion}
          />
          <Stats items={stats} />

          <section id="practices" className="anchor-section">
            <div className="section-head">
              <h2>Практики</h2>
              {requests.length > 0 && (
                <div className="segmented" role="tablist" aria-label="Какие практики показать">
                  <button role="tab" aria-selected={filter === "all"} className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>
                    Все <span>{sorted.length}</span>
                  </button>
                  <button role="tab" aria-selected={filter === "good"} className={filter === "good" ? "is-active" : ""} onClick={() => setFilter("good")}>
                    Подходят {GOOD_MATCH}%+ <span>{good.length}</span>
                  </button>
                </div>
              )}
            </div>
            <div className="request-list">
              {loading && <div className="card page-state">Загружаю заявки…</div>}
              {error && <div className="card page-state">Не удалось загрузить заявки: {error}</div>}
              {!loading && !error && requests.length === 0 && (
                <div className="card page-state">Опубликованных заявок пока нет — включи уведомления в профиле, чтобы узнать о первой</div>
              )}
              {!loading && filter === "good" && requests.length > 0 && good.length === 0 && (
                <div className="card page-state">
                  Пока ни одна заявка не подходит на {GOOD_MATCH}% — добавь в профиль навыки из блока «Как поднять совпадение»
                </div>
              )}
              {shown.map(({ request, match }) => (
                <RequestCard key={request.id} request={request} match={match} mySkills={mySkills} onOpen={() => setOpenedId(request.id)} />
              ))}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>Как проходит распределение</h2>
            </div>
            <div className="card">
              <Stepper steps={steps} />
              {stepNote && <p className="small step-note">{stepNote}</p>}
              <p className="muted small">
                После принятия предложения остальные отклики закрываются. Вуз подтверждает
                закрепление, после чего данные могут быть выгружены для приказа.
              </p>
            </div>
          </section>
        </div>

        <aside className="home__side">
          <ProfileCard completion={completion} badges={badges} />
          {/* Пока не загружены профиль и заявки, не показываем — иначе мелькнёт «Профиль готов» */}
          {profile && !loading && <NextStepCard lackingSkills={lackingSkills} missing={missing} />}
        </aside>
      </div>

      {opened && (
        <RequestDetailsModal request={opened.request} match={opened.match} mySkills={mySkills} onClose={() => setOpenedId(null)} />
      )}
    </main>
  );
}
