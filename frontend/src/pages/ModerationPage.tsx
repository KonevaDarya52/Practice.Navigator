import { useCallback, useEffect, useState } from "react";
import { Building2, Check, FileText, RotateCcw, X } from "lucide-react";
import { api, ApiError } from "../api/client";
import type { ModerationOrganization, ModerationSummary, PracticeRequest } from "../api/types";
import { RequestDetails } from "../components/cabinet/common";
import { formatDate } from "../lib/format";
import "../styles/cabinet.css";

type Decision = "approve" | "return" | "reject";
type Tab = "organizations" | "requests";

// Комментарий и кнопки решения под карточкой
function DecisionBox({
  options,
  onDecide,
}: {
  options: { decision: Decision; label: string }[];
  onDecide: (decision: Decision, comment: string) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const icons = { approve: Check, return: RotateCcw, reject: X };
  const styles = { approve: "btn--primary", return: "btn--outline", reject: "btn--danger" };

  const decide = async (decision: Decision) => {
    setBusy(true);
    setError("");
    try {
      await onDecide(decision, comment);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить решение");
      setBusy(false);
    }
  };

  return (
    <div className="decision">
      <textarea
        rows={2}
        placeholder="Комментарий для компании (обязателен, если возвращаете или отклоняете)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        aria-label="Комментарий"
      />
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
      <div className="decision__buttons">
        {options.map(({ decision, label }) => {
          const Icon = icons[decision];
          return (
            <button key={decision} className={`btn btn--sm ${styles[decision]}`} disabled={busy} onClick={() => decide(decision)}>
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Кабинет вуза: проверка компаний и модерация заявок
export function ModerationPage() {
  const [tab, setTab] = useState<Tab>("requests");
  const [summary, setSummary] = useState<ModerationSummary | null>(null);
  const [orgs, setOrgs] = useState<ModerationOrganization[]>([]);
  const [requests, setRequests] = useState<PracticeRequest[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, o, r] = await Promise.all([
        api<ModerationSummary>("GET", "/moderation/summary"),
        api<ModerationOrganization[]>("GET", "/moderation/organizations"),
        api<PracticeRequest[]>("GET", "/moderation/requests"),
      ]);
      setSummary(s);
      setOrgs(o);
      setRequests(r);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить данные");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decideOrg = async (id: string, decision: Decision, comment: string) => {
    await api("POST", `/moderation/organizations/${id}/decision`, { decision, comment });
    await load();
  };
  const decideRequest = async (id: string, decision: Decision, comment: string) => {
    await api("POST", `/moderation/requests/${id}/decision`, { decision, comment });
    await load();
  };

  return (
    <main className="page cabinet">
      <section className="cabinet__head">
        <div>
          <p className="eyebrow">Кабинет вуза</p>
          <h1>Модерация</h1>
          <p className="muted">Проверьте компании и заявки, прежде чем студенты их увидят.</p>
        </div>
      </section>

      {error && (
        <div className="notice notice--danger" role="alert">
          {error}
        </div>
      )}

      <div className="cabinet__tiles">
        <div className="tile">
          <strong>{summary?.organizationsPending ?? "—"}</strong>
          <span>Компаний ждут проверки</span>
        </div>
        <div className="tile">
          <strong>{summary?.requestsPending ?? "—"}</strong>
          <span>Заявок на модерации</span>
        </div>
        <div className="tile">
          <strong>{summary?.requestsPublished ?? "—"}</strong>
          <span>Опубликовано заявок</span>
        </div>
      </div>

      <div className="tabs cabinet__tabs" role="tablist">
        <button role="tab" aria-selected={tab === "requests"} className={tab === "requests" ? "tab tab--active" : "tab"} onClick={() => setTab("requests")}>
          <FileText size={15} /> Заявки <span className="tab__count">{requests.length}</span>
        </button>
        <button role="tab" aria-selected={tab === "organizations"} className={tab === "organizations" ? "tab tab--active" : "tab"} onClick={() => setTab("organizations")}>
          <Building2 size={15} /> Компании <span className="tab__count">{orgs.length}</span>
        </button>
      </div>

      <section className="cabinet__list">
        {tab === "requests" && requests.length === 0 && <div className="card page-state">Заявок на модерации нет</div>}
        {tab === "requests" &&
          requests.map((request) => (
            <article className="card request-item" key={request.id}>
              <header className="request-item__head">
                <div>
                  <p className="muted small">
                    {request.organization.name} · отправлена {formatDate(request.updatedAt)}
                  </p>
                  <h3>{request.title}</h3>
                </div>
              </header>
              <RequestDetails request={request} />
              <DecisionBox
                options={[
                  { decision: "approve", label: "Опубликовать" },
                  { decision: "return", label: "На доработку" },
                  { decision: "reject", label: "Отклонить" },
                ]}
                onDecide={(d, c) => decideRequest(request.id, d, c)}
              />
            </article>
          ))}

        {tab === "organizations" && orgs.length === 0 && <div className="card page-state">Компаний на проверке нет</div>}
        {tab === "organizations" &&
          orgs.map((org) => (
            <article className="card request-item" key={org.id}>
              <header className="request-item__head">
                <div>
                  <p className="muted small">Зарегистрирована {formatDate(org.createdAt)}</p>
                  <h3>{org.name}</h3>
                </div>
              </header>
              <dl className="request-details__grid">
                <div>
                  <dt>ИНН</dt>
                  <dd>{org.inn}</dd>
                </div>
                <div>
                  <dt>Представитель</dt>
                  <dd>{org.owner.fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{org.owner.email}</dd>
                </div>
                <div>
                  <dt>Телефон</dt>
                  <dd>{org.contactPhone || "—"}</dd>
                </div>
              </dl>
              <DecisionBox
                options={[
                  { decision: "approve", label: "Одобрить" },
                  { decision: "reject", label: "Отклонить" },
                ]}
                onDecide={(d, c) => decideOrg(org.id, d, c)}
              />
            </article>
          ))}
      </section>
    </main>
  );
}
