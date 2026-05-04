"use client";

import type { NavUser } from "@/lib/auth/nav-user";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AppsGridButton } from "@/components/layout/AppsGridButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserDropdown } from "@/components/layout/UserDropdown";

type AppNavProps = {
  user: NavUser;
};

export function AppNav({ user }: AppNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white font-sans dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-[65px] max-w-7xl items-center gap-4 px-5">
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-text-body transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:size-10 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          onClick={() => console.log("menu clicked")}
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
  );
}
