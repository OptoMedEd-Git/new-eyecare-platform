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
    surface: "rounded-lg border border-red-200 bg-red-50 p-4 text-red-800",
    iconClassName: "text-red-600",
    Icon: AlertCircle,
    role: "alert",
  },
  warning: {
    surface: "rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800",
    iconClassName: "text-amber-600",
    Icon: AlertTriangle,
    role: "alert",
  },
  success: {
    surface: "rounded-lg border border-green-200 bg-green-50 p-4 text-green-800",
    iconClassName: "text-green-600",
    Icon: CheckCircle2,
    role: "status",
  },
  info: {
    surface: "rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800",
    iconClassName: "text-blue-600",
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
          className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-current/70 hover:bg-black/5 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Dismiss"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
