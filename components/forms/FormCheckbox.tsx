import { Checkbox } from "flowbite-react";
import type { ComponentProps, ReactNode } from "react";
import { forwardRef } from "react";

export interface FormCheckboxProps extends Omit<ComponentProps<typeof Checkbox>, "type" | "color"> {
  label: ReactNode;
  name: string;
  /** When omitted, `name` is used for the control id (label `htmlFor`). */
  id?: string;
  required?: boolean;
  defaultChecked?: boolean;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  function FormCheckbox(
    {
      label,
      name,
      id,
      required,
      defaultChecked,
      error,
      className,
      ...checkboxProps
    },
    ref
  ) {
    const controlId = id ?? name;
    const errorId = `${controlId}-error`;

    return (
      <div className={className}>
        <div className="flex gap-3">
          <Checkbox
            ref={ref}
            id={controlId}
            name={name}
            required={required}
            defaultChecked={defaultChecked}
            color={error ? "failure" : "default"}
            className="mt-0.5 shrink-0"
            aria-invalid={error ? "true" : undefined}
            aria-required={required || undefined}
            aria-describedby={error ? errorId : undefined}
            {...checkboxProps}
          />
          <label
            htmlFor={controlId}
            className="cursor-pointer text-base leading-6 text-gray-700 select-none dark:text-gray-300"
          >
            {label}
          </label>
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

FormCheckbox.displayName = "FormCheckbox";
