"use client";

import {
  BookMarked,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Route,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/pathways", label: "Pathways", Icon: Route },
  { href: "/courses", label: "Courses", Icon: BookOpen },
  { href: "/quiz-bank", label: "Quiz Bank", Icon: HelpCircle },
  { href: "/flashcards", label: "Flashcards", Icon: Layers },
  { href: "/cases", label: "Cases", Icon: ClipboardList },
  { href: "/encyclopedia", label: "Encyclopedia", Icon: BookMarked },
] as const;

export type AppSideNavProps = {
  isOpen: boolean;
  isLocked: boolean;
  onBackdropClick: () => void;
  onSidebarPointerEnter: () => void;
  onSidebarPointerLeave: () => void;
  onNavLinkClick: () => void;
};

export const AppSideNav = forwardRef<HTMLElement, AppSideNavProps>(
  function AppSideNav(
    {
      isOpen,
      isLocked,
      onBackdropClick,
      onSidebarPointerEnter,
      onSidebarPointerLeave,
      onNavLinkClick,
    },
    ref,
  ) {
    const pathname = usePathname();

    const itemClass = (active: boolean) =>
      [
        "flex items-center gap-3 rounded-md p-3 text-sm transition-colors duration-200",
        active
          ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"
          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/80",
      ].join(" ");

    return (
      <>
        {/* Backdrop: interactive only when locked; lighter tint for hover preview */}
        <div
          className={`fixed inset-x-0 bottom-0 top-[65px] z-30 transition-opacity duration-200 ease-out ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          } ${isLocked ? "pointer-events-auto bg-black/40" : "pointer-events-none bg-black/20"}`}
          aria-hidden
          onClick={isLocked ? onBackdropClick : undefined}
        />

        <aside
          ref={ref}
          id="side-nav"
          role="navigation"
          aria-label="Main navigation"
          onMouseEnter={onSidebarPointerEnter}
          onMouseLeave={onSidebarPointerLeave}
          className={`fixed left-0 top-[65px] z-40 flex h-[calc(100vh-65px)] w-[min(280px,100%-1rem)] max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-out dark:border-gray-700 dark:bg-gray-900 sm:max-w-none sm:w-[280px] ${
            isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-4">
            <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Learn
            </p>
            <nav className="flex flex-col gap-0.5" aria-label="App learn navigation">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={itemClass(active)}
                    onClick={onNavLinkClick}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden strokeWidth={2} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/40">
                <Lightbulb
                  className="mb-2 size-5 text-brand dark:text-blue-400"
                  aria-hidden
                  strokeWidth={2}
                />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Just getting started?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-body dark:text-gray-400">
                  Your dashboard adapts as you use the platform. Sign up for updates to know when new
                  content launches.
                </p>
                <Link
                  href="/settings"
                  className="mt-3 inline-flex text-sm font-medium text-brand transition-colors duration-200 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={onNavLinkClick}
                >
                  Update preferences →
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  },
);
