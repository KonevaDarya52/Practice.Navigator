import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";

type Notification = {
  id: string;
  title: string;
  text: string;
  link: string;
  createdAt: string;
  readAt: string | null;
};

type NotificationsResponse = { unread: number; items: Notification[] };

const REFRESH_MS = 60_000; // раз в минуту проверяем, не появилось ли новое

// «12.11, 14:05» — время по часам пользователя
function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Колокольчик в шапке: счётчик непрочитанных и список уведомлений с сервера
export function NotificationsBell() {
  const [data, setData] = useState<NotificationsResponse>({ unread: 0, items: [] });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const load = useCallback(() => {
    api<NotificationsResponse>("GET", "/notifications").then(setData).catch(() => {});
  }, []);

  // При загрузке, раз в минуту и при переходе между страницами
  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load, location.pathname]);

  useEffect(() => setOpen(false), [location.pathname]);

  // Закрываем список по клику вне его и по Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) load();
    setOpen((v) => !v);
  };

  const openItem = async (item: Notification) => {
    if (!item.readAt) {
      setData((d) => ({
        unread: Math.max(0, d.unread - 1),
        items: d.items.map((x) => (x.id === item.id ? { ...x, readAt: new Date().toISOString() } : x)),
      }));
      api("POST", `/notifications/${item.id}/read`).catch(() => {});
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  const readAll = async () => {
    const now = new Date().toISOString();
    setData((d) => ({ unread: 0, items: d.items.map((x) => ({ ...x, readAt: x.readAt ?? now })) }));
    await api("POST", "/notifications/read-all").catch(() => {});
  };

  const label = data.unread > 0 ? `Уведомления: ${data.unread} новых` : "Уведомления";

  return (
    <div className="user-menu" ref={rootRef}>
      <button className="icon-btn" aria-label={label} title={label} aria-expanded={open} onClick={toggle}>
        <Bell size={20} />
        {data.unread > 0 && <span className="icon-btn__badge">{data.unread > 99 ? "99+" : data.unread}</span>}
      </button>

      {open && (
        <div className="dropdown notifications" role="dialog" aria-label="Уведомления">
          <div className="notifications__head">
            <b>Уведомления</b>
            {data.unread > 0 && (
              <button type="button" className="notifications__read-all" onClick={readAll}>
                Прочитать все
              </button>
            )}
          </div>

          {data.items.length === 0 ? (
            <p className="notifications__empty">Пока ничего нет</p>
          ) : (
            <ul className="notifications__list">
              {data.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.readAt ? "notification" : "notification notification--unread"}
                    onClick={() => openItem(item)}
                  >
                    <b>{item.title}</b>
                    {item.text && <span>{item.text}</span>}
                    <time dateTime={item.createdAt}>{formatTime(item.createdAt)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
