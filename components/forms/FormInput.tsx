import type { ComponentProps, ReactNode } from "react";
import { forwardRef } from "react";

export interface FormInputProps
  extends Omit<ComponentProps<"input">, "name" | "id" | "type" | "defaultValue"> {
  label: string;
  name: string;
  /** When omitted, `name` is used. Pass a unique id if the same name appears twice. */
  id?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  defaultValue?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    {
      label,
      name,
      id,
      type = "text",
      placeholder,
      required,
      error,
      helperText,
      icon,
      defaultValue,
      className,
      ...inputProps
    },
    ref
  ) {
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
          {icon ? (
            <span
              className="pointer-events-none absolute left-3 top-1/2 inline-flex size-4 -translate-y-1/2 items-center justify-center text-gray-400 [&>svg]:size-4"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={controlId}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            defaultValue={defaultValue}
            aria-invalid={error ? "true" : undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy ? describedBy : undefined}
            className={
              "h-[42px] w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm placeholder:text-gray-400 outline-none ring-offset-0 transition-all duration-150 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:hover:border-gray-600 " +
              (icon ? "pl-10 " : "") +
              (error ? "border-red-500 focus:border-red-500 focus:ring-red-500 " : "border-gray-200 ") +
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            }
            {...inputProps}
          />
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

FormInput.displayName = "FormInput";
