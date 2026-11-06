import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { api, ApiError } from "../../api/client";
import type { Dictionaries, PracticeRequest, RequestInput } from "../../api/types";
import { FORMATS, PRACTICE_TYPES } from "../../data/profile";
import { SelectField, TextField } from "../profile/fields";
import { ChipPicker } from "./common";
import "../../styles/form.css";

const EMPTY: RequestInput = {
  title: "",
  description: "",
  practiceType: "Производственная",
  directions: [],
  courses: [],
  places: 1,
  dateFrom: null,
  dateTo: null,
  deadline: null,
  format: "Офис",
  city: "Тюмень",
  address: "",
  paid: false,
  tasks: [],
  requiredSkills: [],
  desiredSkills: [],
  mentor: "",
};

type Props = {
  request: PracticeRequest | null; // null — новая заявка
  onClose: () => void;
  onSaved: () => void;
};

// Форма заявки компании (поля как на слайде «Анкета и заявка компании»)
export function RequestFormModal({ request, onClose, onSaved }: Props) {
  const [form, setForm] = useState<RequestInput>(() => (request ? { ...EMPTY, ...request } : EMPTY));
  const [tasksText, setTasksText] = useState((request?.tasks ?? []).join("\n"));
  const [dicts, setDicts] = useState<Dictionaries>({ directions: [], skills: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Dictionaries>("GET", "/dictionaries").then(setDicts).catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof RequestInput>(key: K, value: RequestInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleCourse = (course: number) =>
    set("courses", form.courses.includes(course) ? form.courses.filter((c) => c !== course) : [...form.courses, course].sort());

  const skillNames = dicts.skills.map((s) => s.name);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage("");
    const body: RequestInput = {
      ...form,
      tasks: tasksText.split("\n").map((t) => t.trim()).filter(Boolean),
      // Пустые даты отправляем как null
      dateFrom: form.dateFrom || null,
      dateTo: form.dateTo || null,
      deadline: form.deadline || null,
    };
    try {
      if (request) await api("PUT", `/company/requests/${request.id}`, body);
      else await api("POST", "/company/requests", body);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setMessage(err.message);
      } else setMessage("Не удалось сохранить заявку");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <form onSubmit={onSubmit} noValidate>
          <header className="modal__head">
            <h2 id="request-title">{request ? "Редактирование заявки" : "Новая заявка"}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <X size={20} />
            </button>
          </header>

          <div className="modal__body">
            <div className="form-grid">
              <TextField label="Название" required wide value={form.title} onChange={(v) => set("title", v)} error={errors.title} placeholder="Стажёр-разработчик Python" />
              <div className="field field--wide">
                <label htmlFor="req-desc">Описание</label>
                <textarea id="req-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <SelectField label="Тип практики" value={form.practiceType} options={PRACTICE_TYPES} onChange={(v) => set("practiceType", v)} />
              <TextField label="Количество мест" type="number" value={String(form.places)} onChange={(v) => set("places", Number(v) || 1)} error={errors.places} />

              <ChipPicker label="Направления подготовки" value={form.directions} options={dicts.directions.map((d) => d.name)} onChange={(v) => set("directions", v)} placeholder="Добавить направление…" />

              <div className="field field--wide">
                <span className="form-label form-label--inline">Курсы</span>
                <div className="course-picker">
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <label key={c} className={form.courses.includes(c) ? "course course--on" : "course"}>
                      <input type="checkbox" checked={form.courses.includes(c)} onChange={() => toggleCourse(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <TextField label="Начало практики" type="date" value={form.dateFrom ?? ""} onChange={(v) => set("dateFrom", v)} />
              <TextField label="Окончание практики" type="date" value={form.dateTo ?? ""} onChange={(v) => set("dateTo", v)} />
              <TextField label="Дедлайн откликов" type="date" value={form.deadline ?? ""} onChange={(v) => set("deadline", v)} />
              <SelectField label="Формат" value={form.format} options={FORMATS} onChange={(v) => set("format", v)} />
              <TextField label="Город" value={form.city} onChange={(v) => set("city", v)} />
              <TextField label="Адрес" value={form.address} onChange={(v) => set("address", v)} />
              <TextField label="Наставник от компании" wide value={form.mentor} onChange={(v) => set("mentor", v)} placeholder="ФИО и должность" />

              <div className="field field--wide">
                <label htmlFor="req-tasks">Задачи практиканта — по одной в строке</label>
                <textarea id="req-tasks" rows={3} value={tasksText} onChange={(e) => setTasksText(e.target.value)} />
              </div>

              <ChipPicker label="Обязательные навыки" value={form.requiredSkills} options={skillNames} onChange={(v) => set("requiredSkills", v)} placeholder="Добавить навык…" />
              <ChipPicker label="Желательные навыки" value={form.desiredSkills} options={skillNames} onChange={(v) => set("desiredSkills", v)} placeholder="Добавить навык…" />
            </div>

            <label className="check">
              <input type="checkbox" checked={form.paid} onChange={(e) => set("paid", e.target.checked)} />
              Оплачиваемая практика
            </label>
          </div>

          <footer className="modal__foot">
            <span className="field__error" role="alert">
              {message}
            </span>
            <div className="modal__foot-actions">
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? "Сохраняю…" : "Сохранить черновик"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
