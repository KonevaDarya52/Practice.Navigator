import { useId, type ReactNode } from "react";

// Простые поля формы с подписью и текстом ошибки

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  wide?: boolean; // поле на всю ширину формы
  children: (id: string) => ReactNode;
};

function Field({ label, error, hint, wide, children }: FieldProps) {
  const id = useId();
  return (
    <div className={wide ? "field field--wide" : "field"}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "date" | "number" | "url";
  placeholder?: string;
  error?: string;
  hint?: string;
  wide?: boolean;
  required?: boolean;
};

export function TextField({ label, value, onChange, type = "text", placeholder, error, hint, wide, required }: TextFieldProps) {
  return (
    <Field label={required ? `${label} *` : label} error={error} hint={hint} wide={wide}>
      {(id) => (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  wide?: boolean;
};

export function SelectField({ label, value, options, onChange, wide }: SelectFieldProps) {
  return (
    <Field label={label} wide={wide}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
