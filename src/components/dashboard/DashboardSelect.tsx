import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

type DashboardSelectProps = {
  name?: string;
  options: SelectOption[];
  placeholder: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
};

/** Selector propio para que los menús del panel no dependan del estilo del navegador. */
export default function DashboardSelect({
  name,
  options,
  placeholder,
  defaultValue = "",
  value,
  onChange,
  ariaLabel,
}: DashboardSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const choose = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`dashboard-event-type-picker dashboard-custom-select ${isOpen ? "is-open" : ""}`}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <button
        type="button"
        className={`dashboard-picker-input dashboard-event-type-picker__trigger ${selected ? "has-value" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="dashboard-event-type-menu" role="listbox" aria-label={ariaLabel ?? placeholder}>
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              className={option.value === selectedValue ? "is-selected" : ""}
              key={option.value}
              onClick={() => choose(option.value)}
            >
              <strong>{option.label}</strong>
              {option.description && <small>{option.description}</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
