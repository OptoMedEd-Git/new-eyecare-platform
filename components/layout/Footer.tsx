import { FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";

export type FooterLink = {
  label: string;
  href?: string;
};

const CLICKABLE_LINK_CLASS =
  "cursor-pointer text-base leading-6 text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400";

const DISABLED_LINK_CLASS =
  "text-base leading-6 text-gray-400 dark:text-gray-500 cursor-default";

const COLUMN_TITLE_CLASS =
  "text-base font-medium leading-4 text-gray-900 dark:text-gray-100";

function FooterLinkRow({ item }: { item: FooterLink }) {
  if (item.href) {
    return (
      <Link href={item.href} className={CLICKABLE_LINK_CLASS}>
        {item.label}
      </Link>
    );
  }
  return <span className={DISABLED_LINK_CLASS}>{item.label}</span>;
}

function FooterColumn({ title, links }: { title: string; links: readonly FooterLink[] }) {
  return (
    <div className="flex w-full flex-col gap-5 md:w-44 md:shrink-0">
      <p className={COLUMN_TITLE_CLASS}>{title}</p>
      <div className="flex flex-col gap-4">
        {links.map((item) => (
          <FooterLinkRow key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

const PLATFORM_LINKS: readonly FooterLink[] = [
  { label: "Pathways" },
  { label: "Courses" },
  { label: "Quiz Bank" },
  { label: "Flashcards" },
  { label: "Encyclopedia" },
  { label: "Cases" },
];

const RESOURCES_LINKS: readonly FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Patient Education" },
  { label: "Clinical Tools" },
  { label: "Events Calendar" },
  { label: "For Educators" },
  { label: "For Institutions" },
];

const COMPANY_LINKS: readonly FooterLink[] = [
  { label: "About us", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact us" },
  { label: "Press Kit" },
];

const LEGAL_LINKS: readonly FooterLink[] = [
  { label: "Privacy policy" },
  { label: "Terms of Service" },
  { label: "Cookie Policy" },
  { label: "Accessibility" },
];

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    Icon: FaLinkedinIn,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    Icon: FaXTwitter,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    Icon: FaInstagram,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    Icon: FaYoutube,
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-white font-sans dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 pt-16 pb-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
            <div className="flex max-w-md flex-col gap-6 lg:h-[220px] lg:w-96 lg:max-w-none lg:shrink-0">
              <Link
                href="/"
                className="flex w-fit items-center gap-1.5 no-underline hover:no-underline"
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
              <p className="text-base font-normal leading-6 text-text-body dark:text-gray-300">
                Eye care education for every stage of your career.
              </p>
              <div className="flex items-center gap-4">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Icon size={18} aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            <nav
              aria-label="Footer navigation"
              className="flex flex-col gap-10 md:flex-row md:flex-1 md:justify-between md:gap-4 lg:gap-6"
            >
              <FooterColumn title="Platform" links={PLATFORM_LINKS} />
              <FooterColumn title="Resources" links={RESOURCES_LINKS} />
              <FooterColumn title="Company" links={COMPANY_LINKS} />
              <FooterColumn title="Legal" links={LEGAL_LINKS} />
            </nav>
          </div>

          <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
            <p className="text-center text-base font-normal leading-6 text-text-body dark:text-gray-400">
              © 2026 OptoMedEd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
