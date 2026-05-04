"use client";

import type { NavUser } from "@/lib/auth/nav-user";
import { AppSideNav } from "@/components/layout/AppSideNav";
import { AppsGridButton } from "@/components/layout/AppsGridButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserDropdown } from "@/components/layout/UserDropdown";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const HOVER_CLOSE_MS = 140;

type AppNavProps = {
  user: NavUser;
};

export function AppNav({ user }: AppNavProps) {
  const [locked, setLocked] = useState(false);
  const [hoverActive, setHoverActive] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedRef = useRef(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!lockedRef.current) {
        setHoverActive(false);
      }
      closeTimerRef.current = null;
    }, HOVER_CLOSE_MS);
  }, [clearCloseTimer]);

  const onHamburgerEnter = useCallback(() => {
    clearCloseTimer();
    setHoverActive(true);
  }, [clearCloseTimer]);

  const onHamburgerLeave = useCallback(() => {
    scheduleHoverClose();
  }, [scheduleHoverClose]);

  const onSidebarEnter = useCallback(() => {
    clearCloseTimer();
    setHoverActive(true);
  }, [clearCloseTimer]);

  const onSidebarLeave = useCallback(() => {
    scheduleHoverClose();
  }, [scheduleHoverClose]);

  const isOpen = locked || hoverActive;

  const toggleLocked = useCallback(() => {
    setLocked((prev) => {
      const next = !prev;
      if (!next) {
        setHoverActive(false);
      }
      clearCloseTimer();
      return next;
    });
  }, [clearCloseTimer]);

  const closeLocked = useCallback(() => {
    setLocked(false);
    clearCloseTimer();
  }, [clearCloseTimer]);

  const onBackdropClick = useCallback(() => {
    if (locked) {
      closeLocked();
    }
  }, [locked, closeLocked]);

  const onNavLinkClick = useCallback(() => {
    setLocked(false);
    setHoverActive(false);
    clearCloseTimer();
  }, [clearCloseTimer]);

  // Click outside (locked): close when target is not hamburger or sidebar
  useEffect(() => {
    if (!locked) return;

    function handlePointerDown(event: PointerEvent) {
      const t = event.target as Node;
      if (hamburgerRef.current?.contains(t)) return;
      if (sidebarRef.current?.contains(t)) return;
      setLocked(false);
      clearCloseTimer();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [locked, clearCloseTimer]);

  // Escape closes drawer in both hover preview and locked states
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setLocked(false);
        setHoverActive(false);
        clearCloseTimer();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, clearCloseTimer]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white font-sans dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-[65px] max-w-7xl items-center gap-4 px-5">
          <button
            ref={hamburgerRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="side-nav"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-text-body transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:size-10 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            onMouseEnter={onHamburgerEnter}
            onMouseLeave={onHamburgerLeave}
            onClick={toggleLocked}
          >
            <Menu className="size-5 md:size-6" aria-hidden strokeWidth={2} />
          </button>

          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-1.5 py-[2px] no-underline hover:no-underline"
          >
            <Image
              src="/logos/logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px] shrink-0"
              unoptimized
            />
            <span className="truncate text-2xl font-semibold text-[#101828] dark:text-slate-200">
              OptoMedEd
            </span>
          </Link>

          <div className="min-w-0 flex-1" aria-hidden />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AppsGridButton />
            <NotificationBell />
            <UserDropdown user={user} />
          </div>
        </div>
      </header>

      <AppSideNav
        ref={sidebarRef}
        isOpen={isOpen}
        isLocked={locked}
        onBackdropClick={onBackdropClick}
        onSidebarPointerEnter={onSidebarEnter}
        onSidebarPointerLeave={onSidebarLeave}
        onNavLinkClick={onNavLinkClick}
      />
    </>
  );
}
