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

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function parseJson(text: string): unknown {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

// Общая часть всех запросов: токен, обработка ошибок. Возвращает ответ, если он успешный
async function request(method: Method, path: string, body?: unknown): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Файлы (FormData) отправляем как есть — браузер сам поставит multipart/form-data
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Нет связи с сервером");
  }

  if (!response.ok) {
    // Токен истёк или недействителен — сообщаем приложению, чтобы оно разлогинило
    if (response.status === 401 && token) window.dispatchEvent(new Event("pn-unauthorized"));
    throw parseError(response.status, parseJson(await response.text()));
  }
  return response;
}

// JSON-запрос. body может быть объектом (уйдёт как JSON) или FormData (для загрузки файлов)
export async function api<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const response = await request(method, path, body);
  return parseJson(await response.text()) as T;
}

// Скачать файл (например, PDF резюме) — с токеном, поэтому обычная ссылка <a href> не подойдёт
export async function apiBlob(path: string): Promise<Blob> {
  const response = await request("GET", path);
  return response.blob();
}
