"use client";

import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends Omit<ComponentProps<"select">, "name" | "id" | "children" | "defaultValue"> {
  label: string;
  name: string;
  /** When omitted, `name` is used. Pass a unique id if the same name appears twice. */
  id?: string;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
  icon?: ReactNode;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  function FormSelect(
    {
      label,
      name,
      id,
      options,
      placeholder = "Select one",
      required,
      error,
      defaultValue,
      icon,
      className,
      ...selectProps
    },
    _ref
  ) {
    const controlId = id ?? name;
    const errorId = `${controlId}-error`;
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [value, setValue] = useState<string>(defaultValue ?? "");

    const selectedOption = useMemo(
      () => options.find((o) => o.value === value) ?? null,
      [options, value]
    );

    // Allow passing common HTML attributes (e.g. `disabled`, `data-*`) without
    // letting `<select>`-typed event handlers conflict with our `<button>`.
    const {
      onClick: _ignoredOnClick,
      onKeyDown: _ignoredOnKeyDown,
      onChange: selectOnChange,
      ...restSelectProps
    } = selectProps as unknown as ComponentProps<"select">;
    const buttonProps = restSelectProps as unknown as ComponentProps<"button">;

    useEffect(() => {
      function onPointerDown(e: MouseEvent) {
        if (!open) return;
        const target = e.target as Node | null;
        if (!target) return;
        if (rootRef.current && !rootRef.current.contains(target)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }
      window.addEventListener("mousedown", onPointerDown);
      return () => window.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    useEffect(() => {
      setValue(defaultValue ?? "");
    }, [defaultValue]);

    useEffect(() => {
      if (!open) return;
      // Ensure an active option when opening.
      const idx = options.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
      // Focus the list so arrow keys work immediately.
      queueMicrotask(() => listRef.current?.focus());
    }, [open, options, value]);

    function selectAtIndex(idx: number) {
      const opt = options[idx];
      if (!opt) return;
      const next = opt.value;
      if (next !== value) {
        setValue(next);
        selectOnChange?.({
          target: { name, value: next },
        } as ChangeEvent<HTMLSelectElement>);
      }
      setOpen(false);
      setActiveIndex(-1);
      queueMicrotask(() => buttonRef.current?.focus());
    }

    function moveActive(delta: number) {
      if (options.length === 0) return;
      setActiveIndex((prev) => {
        const base = prev < 0 ? 0 : prev;
        const next = (base + delta + options.length) % options.length;
        return next;
      });
    }

    return (
      <div className={className} ref={rootRef}>
        <label
          htmlFor={controlId}
          className="mb-2 block text-sm font-medium leading-5 text-text-heading dark:text-text-inverse"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-text-fg-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        <div className="relative">
          {icon ? (
            <span
              className="pointer-events-none absolute left-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-text-placeholder [&>svg]:size-4"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
          {/* Hidden input for form submission */}
          <input type="hidden" name={name} value={value} />

          <span
            className="pointer-events-none absolute right-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-text-placeholder"
            aria-hidden
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <button
            ref={buttonRef}
            id={controlId}
            type="button"
            role="combobox"
            aria-controls={`${controlId}-listbox`}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={error ? "true" : undefined}
            aria-required={required || undefined}
            aria-describedby={error ? errorId : undefined}
            onClick={() => setOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!open) setOpen(true);
                else moveActive(1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (!open) setOpen(true);
                else moveActive(-1);
              } else if (e.key === "Enter" || e.key === " ") {
                if (!open) {
                  e.preventDefault();
                  setOpen(true);
                }
              } else if (e.key === "Escape") {
                if (open) {
                  e.preventDefault();
                  setOpen(false);
                  setActiveIndex(-1);
                }
              }
            }}
            className={
              "h-[42px] w-full rounded-lg border bg-bg-primary px-3 py-2.5 pr-10 text-left text-sm text-text-body outline-none ring-offset-0 transition-all duration-150 hover:border-border-default-medium focus:border-border-brand focus:ring-2 focus:ring-ring-brand dark:hover:border-border-default-medium " +
              (icon ? "pl-10 " : "") +
              (error
                ? "border-border-danger focus:border-border-danger focus:ring-2 focus:ring-ring-danger "
                : "border-border-default ") +
              "dark:border-border-default-medium dark:bg-bg-inverse-medium dark:text-text-inverse"
            }
            {...buttonProps}
          >
            <span className={selectedOption ? "text-text-heading dark:text-text-inverse" : "text-text-placeholder"}>
              {selectedOption?.label ?? placeholder}
            </span>
          </button>

          {open ? (
            <div
              id={`${controlId}-listbox`}
              role="listbox"
              tabIndex={-1}
              ref={listRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveActive(1);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moveActive(-1);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (activeIndex >= 0) selectAtIndex(activeIndex);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                  setActiveIndex(-1);
                  queueMicrotask(() => buttonRef.current?.focus());
                }
              }}
              className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-border-default bg-bg-primary-soft shadow-sm focus:outline-none dark:border-border-default-medium dark:bg-bg-inverse"
            >
              {options.map((opt, idx) => {
                const selected = opt.value === value;
                const active = idx === activeIndex;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectAtIndex(idx)}
                    className={
                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm " +
                      (selected ? "bg-bg-tertiary " : active ? "bg-bg-primary " : "") +
                      "text-text-heading dark:text-text-inverse"
                    }
                  >
                    <span
                      className={
                        "inline-flex size-4 items-center justify-center rounded-sm border " +
                        (selected
                          ? "border-border-brand bg-bg-brand text-text-on-brand"
                          : "border-border-default-medium bg-bg-primary-soft text-transparent")
                      }
                      aria-hidden
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="size-3">
                        <path
                          d="M16.5 5.5L8.25 13.75L4 9.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="flex-1">{opt.label}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} className="mt-2 text-sm text-text-fg-danger dark:text-text-fg-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
