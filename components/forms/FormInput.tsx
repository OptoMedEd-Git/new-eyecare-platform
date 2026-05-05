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
              "h-[42px] w-full rounded-lg border bg-bg-primary px-3 py-2.5 text-sm text-text-body placeholder:text-text-placeholder outline-none ring-offset-0 transition-all duration-150 hover:border-border-default-medium focus:border-border-brand focus:ring-2 focus:ring-ring-brand dark:hover:border-border-default-medium " +
              (icon ? "pl-10 " : "") +
              (error
                ? "border-border-danger focus:border-border-danger focus:ring-2 focus:ring-ring-danger "
                : "border-border-default ") +
              "dark:border-border-default-medium dark:bg-bg-inverse-medium dark:text-text-inverse dark:placeholder:text-text-placeholder"
            }
            {...inputProps}
          />
        </div>
        {error ? (
          <p id={errorId} className="mt-2 text-sm text-text-fg-danger dark:text-text-fg-danger" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-2 text-sm text-text-muted dark:text-text-placeholder">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
