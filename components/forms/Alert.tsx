"use client";

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type AlertVariant = "error" | "warning" | "success" | "info";

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: ReactNode;
  onDismiss?: () => void;
}

const VARIANT_STYLES: Record<
  AlertVariant,
  { surface: string; iconClassName: string; Icon: typeof AlertCircle; role: "alert" | "status" }
> = {
  error: {
    surface: "rounded-lg border border-border-danger-subtle bg-bg-danger-softer p-4 text-text-fg-danger-strong",
    iconClassName: "text-text-fg-danger",
    Icon: AlertCircle,
    role: "alert",
  },
  warning: {
    surface: "rounded-lg border border-border-warning-subtle bg-bg-warning-softer p-4 text-text-fg-warning-strong",
    iconClassName: "text-text-fg-warning",
    Icon: AlertTriangle,
    role: "alert",
  },
  success: {
    surface: "rounded-lg border border-border-success-subtle bg-bg-success-softer p-4 text-text-fg-success-strong",
    iconClassName: "text-text-fg-success",
    Icon: CheckCircle2,
    role: "status",
  },
  info: {
    surface: "rounded-lg border border-border-info-subtle bg-bg-info-softer p-4 text-text-fg-info-strong",
    iconClassName: "text-text-fg-info",
    Icon: Info,
    role: "status",
  },
};

export function Alert({ variant, title, message, onDismiss }: AlertProps) {
  const config = VARIANT_STYLES[variant];
  const Icon = config.Icon;

  return (
    <div className={`flex gap-3 ${config.surface}`} role={config.role}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${config.iconClassName}`} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title ? <div className="text-sm font-medium leading-5">{title}</div> : null}
        <div className="text-sm leading-5">{message}</div>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-current/70 hover:bg-black/5 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand"
          aria-label="Dismiss"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
