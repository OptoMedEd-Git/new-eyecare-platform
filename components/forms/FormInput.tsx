import { TextInput } from "flowbite-react";
import type { ComponentProps, FC, ReactNode } from "react";
import { forwardRef } from "react";

/** Adapts optional React icon nodes to Flowbite TextInput's `FC<SVG>` icon slot. */
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
  IconSlot.displayName = "FormInputIconSlot";
  return IconSlot;
}

export interface FormInputProps
  extends Omit<
    ComponentProps<typeof TextInput>,
    "color" | "icon" | "rightIcon" | "addon" | "type" | "name" | "id"
  > {
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
      sizing = "md",
      ...textInputProps
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
        <TextInput
          ref={ref}
          id={controlId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          sizing={sizing}
          color={error ? "failure" : "gray"}
          icon={icon ? iconNodeToFlowbiteIcon(icon) : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy ? describedBy : undefined}
          {...textInputProps}
        />
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
