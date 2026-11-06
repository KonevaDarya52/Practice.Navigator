type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

// Переключатель (вкл/выкл)
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={checked ? "toggle toggle--on" : "toggle"}
      onClick={onChange}
    >
      <span className="toggle__thumb" />
    </button>
  );
}
