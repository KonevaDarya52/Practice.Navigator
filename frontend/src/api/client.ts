// Обращения к backend. Все адреса начинаются с /api/v1 —
// в Docker их обрабатывает FastAPI, в режиме разработки Vite передаёт их на localhost:8000.

const BASE = "/api/v1";
const TOKEN_KEY = "pn-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // без localStorage вход просто не переживёт перезагрузку
  }
}

// Ошибка от сервера: общий текст и ошибки по полям (если сервер их прислал)
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ValidationItem = { loc: (string | number)[]; msg: string };

// FastAPI присылает ошибки либо строкой, либо списком «поле — сообщение»
function parseError(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return new ApiError(status, detail);

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const item of detail as ValidationItem[]) {
      const field = String(item.loc[item.loc.length - 1] ?? "");
      // Убираем служебное «Value error, » из текста pydantic
      fieldErrors[field] = item.msg.replace(/^Value error, /, "");
    }
    const first = Object.values(fieldErrors)[0] ?? "Проверь введённые данные";
    return new ApiError(status, first, fieldErrors);
  }

  return new ApiError(status, status >= 500 ? "Сервер недоступен, попробуй позже" : "Что-то пошло не так");
}

export async function api<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Нет связи с сервером");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // Токен истёк или недействителен — сообщаем приложению, чтобы оно разлогинило
    if (response.status === 401 && token) window.dispatchEvent(new Event("pn-unauthorized"));
    throw parseError(response.status, data);
  }
  return data as T;
}
