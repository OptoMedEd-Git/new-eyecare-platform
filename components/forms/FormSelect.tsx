import { Select } from "flowbite-react";
import type { ComponentProps, FC, ReactNode } from "react";
import { forwardRef } from "react";

function iconNodeToFlowbiteIcon(node: ReactNode): FC<ComponentProps<"svg">> {
  function IconSlot(props: ComponentProps<"svg">) {
    return (
      <span
        className={`inline-flex size-4.5 shrink-0 items-center justify-center text-gray-500 dark:text-gray-400 [&>svg]:size-4.5 ${props.className ?? ""}`}
        aria-hidden
      >
        {node}
      </span>
    );
  }
  IconSlot.displayName = "FormSelectIconSlot";
  return IconSlot;
}

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends Omit<
    ComponentProps<typeof Select>,
    "color" | "icon" | "addon" | "name" | "id" | "children"
  > {
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

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
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
      sizing = "md",
      ...selectProps
    },
    ref
  ) {
    const controlId = id ?? name;
    const errorId = `${controlId}-error`;

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
        <Select
          ref={ref}
          id={controlId}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          sizing={sizing}
          color={error ? "failure" : "gray"}
          icon={icon ? iconNodeToFlowbiteIcon(icon) : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : undefined}
          {...selectProps}
        >
          <option value="" disabled={!!required}>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
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
