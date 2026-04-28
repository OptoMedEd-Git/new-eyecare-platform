"use client";

import type { ComponentProps, ReactNode } from "react";
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
    const { onClick: _ignoredOnClick, onKeyDown: _ignoredOnKeyDown, ...restSelectProps } =
      selectProps as unknown as ComponentProps<"select">;
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
      setValue(opt.value);
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
          className="mb-2 block text-sm font-medium leading-5 text-gray-900 dark:text-gray-100"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        <div className="relative">
          {icon ? (
            <span
              className="pointer-events-none absolute left-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-gray-400 [&>svg]:size-4"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
          {/* Hidden input for form submission */}
          <input type="hidden" name={name} value={value} />

          <span
            className="pointer-events-none absolute right-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-gray-400"
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
              "h-[42px] w-full rounded-lg border bg-gray-50 px-3 py-2.5 pr-10 text-left text-sm placeholder:text-gray-400 outline-none ring-offset-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 " +
              (icon ? "pl-10 " : "") +
              (error ? "border-red-500 focus:border-red-500 focus:ring-red-500 " : "border-gray-200 ") +
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            }
            {...buttonProps}
          >
            <span className={selectedOption ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
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
              className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
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
                      (selected ? "bg-gray-100 " : active ? "bg-gray-50 " : "") +
                      "text-gray-900 dark:text-gray-100"
                    }
                  >
                    <span
                      className={
                        "inline-flex size-4 items-center justify-center rounded-sm border " +
                        (selected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-transparent")
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
          <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
