"use client";

import { MarketingNavUserMenu } from "@/components/layout/MarketingNavUserMenu";
import type { NavUser } from "@/lib/auth/nav-user";
import { Search } from "lucide-react";
import { Button, Navbar } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState, type ComponentProps } from "react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
] as const;

const navLinkClassName =
  "rounded-md px-1 py-1 text-sm font-medium leading-[1.5] text-text-body transition-colors duration-150 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:text-brand";

const loginButtonClassName =
  "border border-gray-200 bg-secondary px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 focus:ring-brand active:translate-y-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700";

const signupButtonClassName =
  "border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus:ring-brand";

function MenuIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export type MarketingNavClientProps = {
  user: NavUser | null;
};

export function MarketingNavClient({ user }: MarketingNavClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelId = useId();

  const loggedInActions = user ? <MarketingNavUserMenu user={user} /> : null;

  return (
    <Navbar
      fluid
      rounded={false}
      border={false}
      className="font-sans border-b border-gray-200 bg-white py-0! dark:border-gray-800 dark:bg-gray-900"
      aria-label="Marketing"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex h-[65px] items-center gap-4 px-5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 pl-[2px] pr-[6px] py-[2px] no-underline hover:no-underline"
          >
            <Image
              src="/logos/logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px] shrink-0"
              unoptimized
            />
            <span className="text-2xl font-semibold text-[#101828] dark:text-slate-200">
              OptoMedEd
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex">
            <nav className="flex items-center gap-6" aria-label="Main">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className={navLinkClassName}>
                  {label}
                </Link>
              ))}
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-base text-text-body transition-colors hover:text-text-heading"
                aria-label="Search (coming soon)"
                title="Search coming soon"
              >
                <Search className="size-4" aria-hidden strokeWidth={2} />
              </button>
            </nav>
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {user ? (
              loggedInActions
            ) : (
              <>
                <Button as={Link} href="/login" color="light" className={loginButtonClassName}>
                  Sign in
                </Button>
                <Button as={Link} href="/signup" className={signupButtonClassName}>
                  Sign up
                </Button>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-0.5 md:hidden">
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-base text-text-body transition-colors hover:text-text-heading"
              aria-label="Search (coming soon)"
              title="Search coming soon"
            >
              <Search className="size-4" aria-hidden strokeWidth={2} />
            </button>
            {user ? <div className="flex items-center gap-2">{loggedInActions}</div> : null}
            <button
              type="button"
              className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label={mobileOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={mobileOpen}
              aria-controls={mobilePanelId}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <MenuIcon className="h-6 w-6 shrink-0" />
            </button>
          </div>
        </div>

        <div
          id={mobilePanelId}
          className={`border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden ${
            mobileOpen ? "block" : "hidden"
          }`}
        >
          <nav className="flex flex-col px-5 pt-3 pb-1" aria-label="Mobile">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={navLinkClassName + " py-2.5"}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          {!user ? (
            <div className="flex flex-col gap-2.5 px-5 pb-4 pt-2">
              <Button
                as={Link}
                href="/login"
                color="light"
                className={loginButtonClassName + " w-full justify-center"}
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Button>
              <Button
                as={Link}
                href="/signup"
                className={signupButtonClassName + " w-full justify-center"}
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Navbar>
  );
}

