import { Alert as FlowbiteAlert } from "flowbite-react";
import type { AlertProps as FlowbiteAlertProps } from "flowbite-react";
import type { ComponentProps } from "react";

export type AlertVariant = "error" | "success" | "info" | "warning";

export interface AlertProps extends Omit<ComponentProps<typeof FlowbiteAlert>, "children" | "color"> {
  variant: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
}

const VARIANT_FLOWBITE_COLOR: Record<
  AlertVariant,
  NonNullable<FlowbiteAlertProps["color"]>
> = {
  error: "failure",
  success: "success",
  info: "blue",
  warning: "warning",
};

const VARIANT_SURFACE: Record<AlertVariant, string> = {
  error: "border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
  success:
    "border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200",
  info: "border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  warning:
    "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
};

export function Alert({ variant, title, message, onDismiss, className, ...rest }: AlertProps) {
  const surface = VARIANT_SURFACE[variant];
  const combinedClassName = [surface, className].filter(Boolean).join(" ");

  return (
    <FlowbiteAlert
      color={VARIANT_FLOWBITE_COLOR[variant]}
      className={combinedClassName}
      onDismiss={onDismiss ? () => onDismiss() : undefined}
      {...rest}
    >
      <div className="flex flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p>{message}</p>
      </div>
    </FlowbiteAlert>
  );
}
