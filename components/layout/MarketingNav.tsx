"use client";

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
  "rounded-md px-1 py-1 text-base font-medium leading-normal text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:text-white";

const loginButtonClassName =
  "border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-body)] shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] hover:bg-gray-50 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

const signupButtonClassName =
  "border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] hover:bg-brand/90 focus:ring-brand";

function SearchIcon(props: ComponentProps<"svg">) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function MenuIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function SearchButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Search"
      onClick={() => console.log("search clicked")}
      className={
        "inline-flex size-6 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800" +
        (className ? ` ${className}` : "")
      }
    >
      <SearchIcon className="size-5" />
    </button>
  );
}

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelId = useId();

  return (
    <Navbar
      fluid
      rounded={false}
      border={false}
      className="font-sans border-b border-gray-200 bg-white py-0! dark:border-gray-800 dark:bg-gray-900"
      aria-label="Marketing"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex h-[65px] items-center gap-3 px-[22px] md:gap-[17px]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 no-underline hover:no-underline"
          >
            <Image
              src="/logos/logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px] shrink-0"
              unoptimized
            />
            <span className="text-2xl font-bold tracking-[0.48px] text-slate-700 dark:text-slate-200">
              OptoMedEd
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-5 md:flex">
            <nav className="flex items-center gap-5" aria-label="Main">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className={navLinkClassName}>
                  {label}
                </Link>
              ))}
            </nav>
            <SearchButton />
          </div>

          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <Button
              as={Link}
              href="/login"
              color="light"
              className={loginButtonClassName}
            >
              Log In
            </Button>
            <Button as={Link} href="/signup" className={signupButtonClassName}>
              Sign Up
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <SearchButton />
            <button
              type="button"
              className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-700"
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
          <nav className="flex flex-col px-[22px] pt-3 pb-1" aria-label="Mobile">
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
            <div className="pt-2">
              <SearchButton />
            </div>
          </nav>
          <div className="flex flex-col gap-2.5 px-[22px] pb-4 pt-2">
            <Button
              as={Link}
              href="/login"
              color="light"
              className={loginButtonClassName + " w-full justify-center"}
              onClick={() => setMobileOpen(false)}
            >
              Log In
            </Button>
            <Button
              as={Link}
              href="/signup"
              className={signupButtonClassName + " w-full justify-center"}
              onClick={() => setMobileOpen(false)}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
