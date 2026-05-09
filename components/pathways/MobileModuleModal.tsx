"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { PathwayModule } from "@/lib/pathways/sample-data";

import { ModuleDetailPanel } from "./ModuleDetailPanel";

type Props = {
  module: PathwayModule | null;
  moduleIndex: number;
  totalModules: number;
  isOpen: boolean;
  onClose: () => void;
};

export function MobileModuleModal({ module, moduleIndex, totalModules, isOpen, onClose }: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => setEntered(false));
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const mq = window.matchMedia("(max-width: 1023px)");

    function syncScrollLock() {
      if (mq.matches) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    syncScrollLock();
    mq.addEventListener("change", syncScrollLock);

    return () => {
      mq.removeEventListener("change", syncScrollLock);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !module) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-module-modal-title"
    >
      <div
        className={[
          "absolute inset-0 bg-bg-inverse/40 backdrop-blur-sm transition-opacity duration-200",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        role="presentation"
        aria-hidden
      />

      <div
        className={[
          "relative z-61 w-full max-w-2xl rounded-t-base bg-bg-primary-soft shadow-xl duration-300 ease-out",
          "max-h-[90vh] overflow-y-auto transition-transform",
          entered ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close module details"
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-bg-primary-soft text-text-muted shadow-sm transition-colors hover:bg-bg-secondary-soft hover:text-text-heading focus:outline-none focus:ring-2 focus:ring-ring-brand"
        >
          <X className="size-5" aria-hidden />
        </button>

        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1 w-10 rounded-full bg-bg-tertiary-medium" aria-hidden />
        </div>

        <span id="mobile-module-modal-title" className="sr-only">
          Module {moduleIndex + 1} details
        </span>

        <div className="p-2 pb-6">
          <ModuleDetailPanel
            module={module}
            moduleIndex={moduleIndex}
            totalModules={totalModules}
            variant="modal"
          />
        </div>
      </div>
    </div>
  );
}
