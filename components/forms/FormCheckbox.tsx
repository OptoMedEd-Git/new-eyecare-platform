import type { ComponentProps, ReactNode } from "react";

export interface FormCheckboxProps
  extends Omit<ComponentProps<"input">, "type" | "name" | "id" | "defaultChecked"> {
  label: ReactNode;
  name: string;
  /** When omitted, `name` is used. */
  id?: string;
  required?: boolean;
  defaultChecked?: boolean;
  error?: string;
}

export function FormCheckbox({
  label,
  name,
  id,
  required = false,
  defaultChecked = false,
  error,
  className,
  ...rest
}: FormCheckboxProps) {
  const controlId = id ?? name;

  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      <label htmlFor={controlId} className="group flex cursor-pointer items-start gap-2">
        <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
          <input
            id={controlId}
            name={name}
            type="checkbox"
            required={required}
            defaultChecked={defaultChecked}
            aria-required={required}
            aria-invalid={!!error}
            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-border-default-medium bg-bg-primary-soft transition-all duration-150 hover:border-border-default-strong checked:border-border-brand checked:bg-bg-brand focus:outline-none focus:ring-2 focus:ring-ring-brand focus:ring-offset-0 dark:hover:border-border-default-strong"
            {...rest}
          />
          <svg
            className="pointer-events-none absolute h-3 w-3 text-text-on-brand opacity-0 transition-opacity peer-checked:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-normal text-text-body select-none [&_a]:font-medium [&_a]:text-text-fg-brand [&_a]:transition-colors [&_a]:duration-150 [&_a:hover]:underline">
          {label}
        </span>
      </label>
      {error ? <p className="ml-6 text-sm text-text-fg-danger">{error}</p> : null}
    </div>
  );
}

export default FormCheckbox;
