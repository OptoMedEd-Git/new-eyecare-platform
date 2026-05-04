"use client";

import { Bell, CreditCard, HelpCircle, Lock, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/settings/account", label: "Account", Icon: User },
  { href: "/settings/payment", label: "Payment & subscriptions", Icon: CreditCard },
  { href: "/settings/security", label: "Security", Icon: Lock },
  { href: "/settings/notifications", label: "Notifications", Icon: Bell },
  { href: "/settings/support", label: "Support", Icon: HelpCircle },
] as const;

const pillBarClass =
  "inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/50";

type SettingsTabsNavProps = {
  /** Unread count for Notifications tab badge; badge hidden when 0. */
  notificationUnreadCount?: number;
};

export function SettingsTabsNav({ notificationUnreadCount = 0 }: SettingsTabsNavProps) {
  const pathname = usePathname();

  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div className="inline-block min-w-0 px-1">
        <nav className={pillBarClass} aria-label="Settings sections">
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const showBadge = href === "/settings/notifications" && notificationUnreadCount > 0;

            return (
              <Link
                key={href}
                href={href}
                className={
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 " +
                  (active
                    ? "bg-white text-brand shadow-sm dark:bg-gray-800 dark:text-blue-400"
                    : "bg-transparent text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100")
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
                <span className="whitespace-nowrap">{label}</span>
                {showBadge ? (
                  <span className="rounded-full bg-red-100 px-2 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                    {notificationUnreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
