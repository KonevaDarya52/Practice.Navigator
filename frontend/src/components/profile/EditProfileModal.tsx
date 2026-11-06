import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, FileText, Plus, Trash2, X } from "lucide-react";
import { ApiError } from "../../api/client";
import { useLoadedProfile } from "../../context/ProfileContext";
import {
  ACHIEVEMENT_KINDS,
  EDUCATION_FORMS,
  EDUCATION_LEVELS,
  FORMATS,
  LANGUAGE_LEVELS,
  PAYMENTS,
  PRACTICE_TYPES,
  PROGRAMMING_LEVELS,
  SKILL_LEVELS,
  type AchievementKind,
  type ProfileData,
  type SkillLevel,
} from "../../data/profile";
import { resizePhoto } from "../../lib/photo";
import { SelectField, TextField } from "./fields";
import "../../styles/form.css";

export type EditTab = "personal" | "study" | "preferences" | "skills" | "languages" | "experience" | "achievements";

const TABS: { id: EditTab; label: string }[] = [
  { id: "personal", label: "Личные данные" },
  { id: "study", label: "Учёба" },
  { id: "preferences", label: "Предпочтения" },
  { id: "skills", label: "Навыки" },
  { id: "languages", label: "Языки и интересы" },
  { id: "experience", label: "Опыт" },
  { id: "achievements", label: "Достижения" },
];

type Errors = Partial<Record<keyof ProfileData, string>>;

// На какой вкладке находится поле — чтобы показать вкладку с первой ошибкой
const FIELD_TAB: Partial<Record<keyof ProfileData, EditTab>> = {
  fullName: "personal",
  email: "personal",
  phone: "personal",
  course: "study",
};

function validate(p: ProfileData): Errors {
  const errors: Errors = {};
  if (p.fullName.trim().split(/\s+/).length < 2) errors.fullName = "Укажи фамилию и имя";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) errors.email = "Проверь адрес почты";
  if (p.phone.trim() && p.phone.replace(/\D/g, "").length < 10) errors.phone = "В номере должно быть не меньше 10 цифр";
  if (!Number.isInteger(p.course) || p.course < 1 || p.course > 6) errors.course = "Курс — число от 1 до 6";
  return errors;
}

type Props = {
  initialTab: EditTab;
  onClose: () => void;
};

export function EditProfileModal({ initialTab, onClose }: Props) {
  const { profile, saveProfile } = useLoadedProfile();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Черновик: изменения применяются только по кнопке «Сохранить»
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [tab, setTab] = useState<EditTab>(initialTab);
  const [errors, setErrors] = useState<Errors>({});
  const [newInterest, setNewInterest] = useState("");
  const [photoError, setPhotoError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Esc закрывает окно, страница под окном не прокручивается
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // Помощники для списков: изменить элемент, удалить, добавить
  type ListKey = "technicalSkills" | "programmingLanguages" | "foreignLanguages" | "experience" | "achievements";
  const updateItem = <K extends ListKey>(key: K, index: number, patch: Partial<ProfileData[K][number]>) =>
    setDraft((d) => ({
      ...d,
      [key]: (d[key] as ProfileData[K][number][]).map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  const removeItem = (key: ListKey, index: number) =>
    setDraft((d) => ({ ...d, [key]: (d[key] as unknown[]).filter((_, i) => i !== index) }));
  const addItem = <K extends ListKey>(key: K, item: ProfileData[K][number]) =>
    setDraft((d) => ({ ...d, [key]: [...(d[key] as ProfileData[K][number][]), item] }));

  const addInterest = () => {
    const value = newInterest.trim();
    if (value && !draft.interests.includes(value)) set("interests", [...draft.interests, value]);
    setNewInterest("");
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      set("photo", await resizePhoto(file));
      setPhotoError("");
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "Не удалось загрузить фото");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Пустые строки в списках не сохраняем
    const cleaned: ProfileData = {
      ...draft,
      technicalSkills: draft.technicalSkills.filter((s) => s.name.trim()),
      programmingLanguages: draft.programmingLanguages.filter((l) => l.name.trim()),
      foreignLanguages: draft.foreignLanguages.filter((l) => l.name.trim()),
      experience: draft.experience.filter((x) => x.title.trim()),
      achievements: draft.achievements.filter((a) => a.title.trim()),
    };
    const found = validate(cleaned);
    setErrors(found);
    const first = Object.keys(found)[0] as keyof ProfileData | undefined;
    if (first) {
      setTab(FIELD_TAB[first] ?? tab);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await saveProfile(cleaned);
      onClose();
    } catch (err) {
      // Сервер проверяет данные ещё раз — показываем его ошибки у полей
      if (err instanceof ApiError) {
        const serverErrors = err.fieldErrors as Errors;
        setErrors(serverErrors);
        const field = Object.keys(serverErrors)[0] as keyof ProfileData | undefined;
        if (field && FIELD_TAB[field]) setTab(FIELD_TAB[field]!);
        setSaveError(err.message);
      } else {
        setSaveError("Не удалось сохранить профиль");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" tabIndex={-1} ref={dialogRef}>
        <form onSubmit={onSubmit} noValidate>
          <header className="modal__head">
            <h2 id="edit-title">Редактирование профиля</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <X size={20} />
            </button>
          </header>

          <nav className="modal__tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? "tab tab--active" : "tab"}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="modal__body">
            {tab === "personal" && (
              <>
                <div className="photo-field">
                  <div className="photo-field__preview">
                    {draft.photo ? <img src={draft.photo} alt="Фото профиля" /> : <Camera size={28} />}
                  </div>
                  <div className="photo-field__actions">
                    <label className="btn btn--outline btn--sm">
                      <input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
                      {draft.photo ? "Заменить фото" : "Загрузить фото"}
                    </label>
                    {draft.photo && (
                      <button type="button" className="link-btn" onClick={() => set("photo", "")}>
                        Удалить
                      </button>
                    )}
                    {photoError && <span className="field__error">{photoError}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <TextField label="ФИО" required wide value={draft.fullName} onChange={(v) => set("fullName", v)} error={errors.fullName} placeholder="Фамилия Имя Отчество" />
                  <TextField label="Статус" value={draft.status} onChange={(v) => set("status", v)} placeholder="Студентка ТИУ" />
                  <TextField label="Дата рождения" type="date" value={draft.birthDate} onChange={(v) => set("birthDate", v)} />
                  <TextField label="Email" type="email" required value={draft.email} onChange={(v) => set("email", v)} error={errors.email} hint="По этой почте ты входишь в сервис" />
                  <TextField label="Телефон" type="tel" value={draft.phone} onChange={(v) => set("phone", v)} error={errors.phone} placeholder="+7 900 000-00-00" />
                  <TextField label="Город" value={draft.city} onChange={(v) => set("city", v)} />
                </div>

                <label className="check">
                  <input type="checkbox" checked={draft.openToOffers} onChange={(e) => set("openToOffers", e.target.checked)} />
                  Открыта для предложений — компании видят профиль в подборке
                </label>
              </>
            )}

            {tab === "study" && (
              <div className="form-grid">
                <TextField label="Университет" wide value={draft.university} onChange={(v) => set("university", v)} />
                <TextField label="Факультет / институт" value={draft.faculty} onChange={(v) => set("faculty", v)} />
                <TextField label="Направление" value={draft.direction} onChange={(v) => set("direction", v)} />
                <TextField label="Курс" type="number" value={String(draft.course)} onChange={(v) => set("course", Number(v))} error={errors.course} />
                <TextField label="Группа" value={draft.group} onChange={(v) => set("group", v)} />
                <SelectField label="Уровень" value={draft.educationLevel} options={EDUCATION_LEVELS} onChange={(v) => set("educationLevel", v)} />
                <SelectField label="Форма обучения" value={draft.educationForm} options={EDUCATION_FORMS} onChange={(v) => set("educationForm", v)} />
                <TextField label="Годы обучения" value={draft.educationPeriod} onChange={(v) => set("educationPeriod", v)} placeholder="2023 — 2027" />
                <TextField label="Средний балл" value={draft.gpa} onChange={(v) => set("gpa", v)} placeholder="4,5" />
              </div>
            )}

            {tab === "preferences" && (
              <>
                <div className="form-grid">
                  <SelectField label="Тип практики" value={draft.practiceType} options={PRACTICE_TYPES} onChange={(v) => set("practiceType", v)} />
                  <SelectField label="Формат" value={draft.format} options={FORMATS} onChange={(v) => set("format", v)} />
                  <TextField label="Город практики" value={draft.preferredCity} onChange={(v) => set("preferredCity", v)} />
                  <SelectField label="Оплата" value={draft.payment} options={PAYMENTS} onChange={(v) => set("payment", v)} />
                  <TextField label="GitHub" wide value={draft.github} onChange={(v) => set("github", v)} placeholder="github.com/username" />
                </div>

                <p className="form-label">Резюме</p>
                <div className="resume-field">
                  <FileText size={18} />
                  <span>{draft.resume || "Файл не выбран"}</span>
                  <label className="btn btn--outline btn--sm">
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => e.target.files?.[0] && set("resume", e.target.files[0].name)}
                    />
                    {draft.resume ? "Заменить" : "Выбрать PDF"}
                  </label>
                  {draft.resume && (
                    <button type="button" className="icon-btn" aria-label="Убрать резюме" onClick={() => set("resume", "")}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="field__hint">Пока сохраняется только имя файла — загрузку на сервер подключим с backend.</p>
              </>
            )}

            {tab === "skills" && (
              <>
                <p className="form-label">Технические навыки</p>
                <div className="rows">
                  {draft.technicalSkills.map((skill, i) => (
                    <div className="row" key={i}>
                      <input aria-label="Навык" placeholder="Например, Docker" value={skill.name} onChange={(e) => updateItem("technicalSkills", i, { name: e.target.value })} />
                      <select aria-label="Уровень" value={skill.level} onChange={(e) => updateItem("technicalSkills", i, { level: Number(e.target.value) as SkillLevel })}>
                        {Object.entries(SKILL_LEVELS).map(([level, label]) => (
                          <option key={level} value={level}>
                            {level} — {label}
                          </option>
                        ))}
                      </select>
                      <RemoveButton onClick={() => removeItem("technicalSkills", i)} />
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => addItem("technicalSkills", { name: "", level: 2 })}>Добавить навык</AddButton>

                <p className="form-label">Языки программирования</p>
                <div className="rows">
                  {draft.programmingLanguages.map((lang, i) => (
                    <div className="row" key={i}>
                      <input aria-label="Язык программирования" placeholder="Например, Go" value={lang.name} onChange={(e) => updateItem("programmingLanguages", i, { name: e.target.value })} />
                      <select aria-label="Уровень" value={lang.level} onChange={(e) => updateItem("programmingLanguages", i, { level: e.target.value })}>
                        {PROGRAMMING_LEVELS.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                      <RemoveButton onClick={() => removeItem("programmingLanguages", i)} />
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => addItem("programmingLanguages", { name: "", level: "Базовый" })}>Добавить язык</AddButton>
              </>
            )}

            {tab === "languages" && (
              <>
                <p className="form-label">Иностранные языки</p>
                <div className="rows">
                  {draft.foreignLanguages.map((lang, i) => (
                    <div className="row" key={i}>
                      <input aria-label="Язык" placeholder="Например, Китайский" value={lang.name} onChange={(e) => updateItem("foreignLanguages", i, { name: e.target.value })} />
                      <select aria-label="Уровень" value={lang.level} onChange={(e) => updateItem("foreignLanguages", i, { level: e.target.value })}>
                        {LANGUAGE_LEVELS.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                      <RemoveButton onClick={() => removeItem("foreignLanguages", i)} />
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => addItem("foreignLanguages", { name: "", level: "A2" })}>Добавить язык</AddButton>

                <p className="form-label">Профессиональные интересы</p>
                <div className="chips">
                  {draft.interests.map((interest) => (
                    <span className="chip chip--accent chip--removable" key={interest}>
                      {interest}
                      <button type="button" aria-label={`Убрать «${interest}»`} onClick={() => set("interests", draft.interests.filter((x) => x !== interest))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="row row--add">
                  <input
                    aria-label="Новый интерес"
                    placeholder="Например, Машинное обучение"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                  />
                  <button type="button" className="btn btn--outline btn--sm" onClick={addInterest}>
                    <Plus size={14} /> Добавить
                  </button>
                </div>
              </>
            )}

            {tab === "experience" && (
              <>
                <p className="form-label">Практики, работа, студенческая активность</p>
                <div className="rows">
                  {draft.experience.map((item, i) => (
                    <div className="row row--card" key={i}>
                      <input aria-label="Роль" placeholder="Роль или вид практики" value={item.title} onChange={(e) => updateItem("experience", i, { title: e.target.value })} />
                      <input aria-label="Место" placeholder="Компания или организация" value={item.place} onChange={(e) => updateItem("experience", i, { place: e.target.value })} />
                      <input aria-label="Период" placeholder="Июль 2025 · 4 недели" value={item.period} onChange={(e) => updateItem("experience", i, { period: e.target.value })} />
                      <RemoveButton onClick={() => removeItem("experience", i)} />
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => addItem("experience", { title: "", place: "", period: "" })}>Добавить опыт</AddButton>
              </>
            )}

            {tab === "achievements" && (
              <>
                <p className="form-label">Сертификаты, курсы, проекты, конференции</p>
                <div className="rows">
                  {draft.achievements.map((item, i) => (
                    <div className="row row--card" key={i}>
                      <select aria-label="Тип" value={item.kind} onChange={(e) => updateItem("achievements", i, { kind: e.target.value as AchievementKind })}>
                        {Object.entries(ACHIEVEMENT_KINDS).map(([kind, label]) => (
                          <option key={kind} value={kind}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <input aria-label="Название" placeholder="Название" value={item.title} onChange={(e) => updateItem("achievements", i, { title: e.target.value })} />
                      <input aria-label="Подробности" placeholder="Где, роль, тема доклада" value={item.details} onChange={(e) => updateItem("achievements", i, { details: e.target.value })} />
                      <input aria-label="Год" placeholder="Год" className="input--short" value={item.year} onChange={(e) => updateItem("achievements", i, { year: e.target.value })} />
                      <input aria-label="Ссылка" placeholder="Ссылка (необязательно)" value={item.link ?? ""} onChange={(e) => updateItem("achievements", i, { link: e.target.value || undefined })} />
                      <RemoveButton onClick={() => removeItem("achievements", i)} />
                    </div>
                  ))}
                </div>
                <AddButton onClick={() => addItem("achievements", { kind: "certificate", title: "", details: "", year: String(new Date().getFullYear()) })}>
                  Добавить достижение
                </AddButton>
              </>
            )}
          </div>

          <footer className="modal__foot">
            <span className="field__error" role="alert">
              {saveError}
            </span>
            <div className="modal__foot-actions">
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? "Сохраняю…" : "Сохранить"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn row__remove" aria-label="Удалить" onClick={onClick}>
      <Trash2 size={16} />
    </button>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" className="link-btn add-btn" onClick={onClick}>
      <Plus size={14} /> {children}
    </button>
  );
}
