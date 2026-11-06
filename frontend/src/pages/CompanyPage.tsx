import { useCallback, useEffect, useState } from "react";
import { CircleCheck, Clock, FilePen, Plus, Send, Trash2, XCircle } from "lucide-react";
import { api, ApiError } from "../api/client";
import type { PracticeRequest, RequestStatus } from "../api/types";
import { RequestDetails, StatusBadge } from "../components/cabinet/common";
import { RequestFormModal } from "../components/cabinet/RequestFormModal";
import { useAuth } from "../context/AuthContext";
import "../styles/cabinet.css";

// Кабинет представителя компании: статус проверки и заявки на практикантов
export function CompanyPage() {
  const { user, refreshUser } = useAuth();
  const org = user?.organization;
  const [requests, setRequests] = useState<PracticeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<PracticeRequest | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await api<PracticeRequest[]>("GET", "/company/requests"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Статус проверки компании мог измениться — спрашиваем сервер
    refreshUser().catch(() => {});
  }, [load, refreshUser]);

  // Действие с заявкой: отправить, закрыть набор, удалить
  const act = async (method: "POST" | "DELETE", path: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await api(method, path);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось выполнить действие");
    }
  };

  const count = (...statuses: RequestStatus[]) => requests.filter((r) => statuses.includes(r.status)).length;

  return (
    <main className="page cabinet">
      <section className="cabinet__head">
        <div>
          <p className="eyebrow">Кабинет компании</p>
          <h1>{org?.name ?? "Компания"}</h1>
          {org && <StatusBadge status={org.status} />}
        </div>
        <button className="btn btn--primary" onClick={() => setEditing("new")}>
          <Plus size={16} /> Новая заявка
        </button>
      </section>

      {org?.status === "pending" && (
        <div className="notice notice--warn">
          <Clock size={18} />
          Вуз проверяет компанию. Пока можно готовить черновики заявок — отправить их на модерацию получится после проверки.
        </div>
      )}
      {org?.status === "rejected" && (
        <div className="notice notice--danger">
          <XCircle size={18} />
          Вуз отклонил компанию{org.moderatorComment ? `: ${org.moderatorComment}` : "."}
        </div>
      )}
      {error && (
        <div className="notice notice--danger" role="alert">
          {error}
        </div>
      )}

      <div className="cabinet__tiles">
        <div className="tile">
          <strong>{count("published")}</strong>
          <span>Опубликовано</span>
        </div>
        <div className="tile">
          <strong>{count("pending")}</strong>
          <span>На модерации</span>
        </div>
        <div className="tile">
          <strong>{count("draft", "returned")}</strong>
          <span>Черновики и доработка</span>
        </div>
        <div className="tile">
          <strong>{requests.reduce((sum, r) => sum + (r.status === "published" ? r.places : 0), 0)}</strong>
          <span>Открытых мест</span>
        </div>
      </div>

      <section className="cabinet__list">
        {loading && <div className="card page-state">Загружаю заявки…</div>}
        {!loading && requests.length === 0 && (
          <div className="card page-state">Заявок пока нет. Нажмите «Новая заявка», чтобы найти практикантов.</div>
        )}

        {requests.map((request) => {
          const editable = request.status === "draft" || request.status === "returned";
          return (
            <article className="card request-item" key={request.id}>
              <header className="request-item__head">
                <h3>{request.title}</h3>
                <StatusBadge status={request.status} />
              </header>

              {request.moderatorComment && (request.status === "returned" || request.status === "rejected") && (
                <div className={request.status === "returned" ? "notice notice--warn" : "notice notice--danger"}>
                  <b>Комментарий вуза:</b> {request.moderatorComment}
                </div>
              )}

              <RequestDetails request={request} />

              <footer className="request-item__actions">
                {editable && (
                  <>
                    <button className="btn btn--outline btn--sm" onClick={() => setEditing(request)}>
                      <FilePen size={14} /> Изменить
                    </button>
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={org?.status !== "approved"}
                      title={org?.status !== "approved" ? "Доступно после проверки компании вузом" : undefined}
                      onClick={() => act("POST", `/company/requests/${request.id}/submit`)}
                    >
                      <Send size={14} /> Отправить на модерацию
                    </button>
                  </>
                )}
                {request.status === "draft" && (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => act("DELETE", `/company/requests/${request.id}`, `Удалить черновик «${request.title}»?`)}
                  >
                    <Trash2 size={14} /> Удалить
                  </button>
                )}
                {request.status === "published" && (
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => act("POST", `/company/requests/${request.id}/close`, "Закрыть набор? Студенты больше не увидят заявку.")}
                  >
                    <CircleCheck size={14} /> Закрыть набор
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </section>

      {editing && (
        <RequestFormModal
          request={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </main>
  );
}
