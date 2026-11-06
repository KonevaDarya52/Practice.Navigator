import { useState, type FormEvent } from "react";
import { Building2, GraduationCap, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { AuthStar } from "../components/AuthStar";
import { StarField } from "../components/StarField";
import { TextField } from "../components/profile/fields";
import { homePath, useAuth } from "../context/AuthContext";
import type { Theme } from "../hooks/useTheme";
import "../styles/form.css";
import "../styles/auth.css";

type Mode = "login" | "register";
type Kind = "student" | "company";

type Props = {
  mode: Mode;
  theme: Theme;
  onToggleTheme: () => void;
};

const EMPTY = {
  email: "",
  password: "",
  fullName: "",
  organizationName: "",
  inn: "",
  contactPhone: "",
  website: "",
};

export function AuthPage({ mode, theme, onToggleTheme }: Props) {
  const { login, registerStudent, registerCompany } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<Kind>("student");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof EMPTY) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage("");
    try {
      const user =
        mode === "login"
          ? await login(form.email, form.password)
          : kind === "student"
            ? await registerStudent({ email: form.email, password: form.password, fullName: form.fullName })
            : await registerCompany(form);
      navigate(homePath(user), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setMessage(err.message);
      } else {
        setMessage("Что-то пошло не так");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      {/* Звёздное небо на весь экран, маленькие звёзды смещаются вслед за мышкой */}
      <StarField />

      <header className="auth__top">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="auth__layout">
        <section className="auth__art">
          <AuthStar />
          <h1 className="auth__brand">
            Practice<span className="auth__brand-dot">.</span>
            <em>Navigator</em>
          </h1>
        </section>

        <form className="auth__card" onSubmit={onSubmit} noValidate>
          <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>

          {mode === "register" && (
            <div className="kind-switch" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={kind === "student"}
                className={kind === "student" ? "kind kind--active" : "kind"}
                onClick={() => setKind("student")}
              >
                <GraduationCap size={20} /> Студент
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={kind === "company"}
                className={kind === "company" ? "kind kind--active" : "kind"}
                onClick={() => setKind("company")}
              >
                <Building2 size={20} /> Компания
              </button>
            </div>
          )}

          <div className="auth__fields">
            {mode === "register" && (
              <TextField
                label={kind === "student" ? "ФИО" : "ФИО представителя компании"}
                required
                value={form.fullName}
                onChange={set("fullName")}
                error={errors.fullName}
                placeholder="Фамилия Имя Отчество"
              />
            )}
            {mode === "register" && kind === "company" && (
              <>
                <TextField label="Название компании" required value={form.organizationName} onChange={set("organizationName")} error={errors.organizationName} placeholder="ООО «Компания»" />
                <TextField label="ИНН" required value={form.inn} onChange={set("inn")} error={errors.inn} hint="10 цифр для организации, 12 — для ИП" />
                <TextField label="Телефон" type="tel" value={form.contactPhone} onChange={set("contactPhone")} />
              </>
            )}
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              hint={mode === "register" && kind === "student" ? "Почта вуза: …@tyuiu.ru" : undefined}
            />
            <TextField
              label="Пароль"
              type="password"
              required
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              hint={mode === "register" ? "Не меньше 8 символов" : undefined}
            />
          </div>

          {mode === "register" && kind === "company" && (
            <p className="field__hint">
              После регистрации вуз проверит компанию. До проверки можно готовить черновики заявок.
            </p>
          )}

          {message && Object.keys(errors).length === 0 && (
            <p className="auth__error" role="alert">
              {message}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>

          <p className="auth__switch">
            {mode === "login" ? (
              <>
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
              </>
            ) : (
              <>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
