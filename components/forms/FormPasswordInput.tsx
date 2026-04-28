"use client";

import { TextInput } from "flowbite-react";
import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";

export interface FormPasswordInputProps
  extends Omit<
    ComponentProps<typeof TextInput>,
    "color" | "icon" | "rightIcon" | "addon" | "type" | "name" | "id"
  > {
  label: string;
  name: string;
  /** When omitted, `name` is used. Pass a unique id if the same name appears twice. */
  id?: string;
  placeholder?: string;
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
      sizing = "md",
      ...textInputProps
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
        <div className="relative [&_input]:pr-11">
          <TextInput
            ref={ref}
            id={controlId}
            name={name}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            required={required}
            defaultValue={defaultValue}
            sizing={sizing}
            color={error ? "failure" : "gray"}
            aria-invalid={error ? "true" : undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy ? describedBy : undefined}
            {...textInputProps}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800"
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
