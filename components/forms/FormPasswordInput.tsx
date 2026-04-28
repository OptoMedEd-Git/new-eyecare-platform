"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";

export interface FormPasswordInputProps
  extends Omit<
    ComponentProps<"input">,
    "name" | "id" | "type" | "placeholder"
  > {
  label: string;
  name: string;
  /** When omitted, `name` is used. Pass a unique id if the same name appears twice. */
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const FormPasswordInput = forwardRef<HTMLInputElement, FormPasswordInputProps>(
  function FormPasswordInput(
    {
      label,
      name,
      id,
      placeholder,
      required,
      error,
      helperText,
      defaultValue,
      className,
      ...inputProps
    },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const controlId = id ?? name;
    const errorId = `${controlId}-error`;
    const helperId = `${controlId}-helper`;
    const describedBy = [helperText ? helperId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={className}>
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
          <span
            className="pointer-events-none absolute left-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-gray-400"
            aria-hidden
          >
            <Lock className="size-4" />
          </span>
          <input
            ref={ref}
            id={controlId}
            name={name}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            required={required}
            defaultValue={defaultValue}
            aria-invalid={error ? "true" : undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy ? describedBy : undefined}
            className={
              "h-[42px] w-full rounded-lg border bg-gray-50 px-3 py-2.5 pl-10 pr-10 text-sm placeholder:text-gray-400 outline-none ring-offset-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 " +
              (error ? "border-red-500 focus:border-red-500 focus:ring-red-500 " : "border-gray-200 ") +
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            }
            {...inputProps}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-gray-400 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-controls={controlId}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="size-4 shrink-0" aria-hidden />
            ) : (
              <Eye className="size-4 shrink-0" aria-hidden />
            )}
          </button>
        </div>
        {error ? (
          <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormPasswordInput.displayName = "FormPasswordInput";
