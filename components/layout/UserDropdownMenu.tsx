"use client";

import { logout } from "@/app/auth-actions";
import { Bell, HelpCircle, Lock, LogOut, SlidersHorizontal, User } from "lucide-react";
import Link from "next/link";

type UserDropdownMenuProps = {
  /** Called after a menu item is clicked (used to close the parent dropdown). */
  onItemClick?: () => void;
  /** Optional className appended to the panel — for parent positioning if needed. */
  className?: string;
  /** Optional id forwarded to the menu container. */
  id?: string;
  /** Optional aria-labelledby forwarded to the menu container. */
  ariaLabelledBy?: string;
};

export function UserDropdownMenu({
  onItemClick,
  className = "",
  id,
  ariaLabelledBy,
}: UserDropdownMenuProps) {
  return (
    <div
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={[
        "z-50 w-52 rounded-base border border-border-default-medium bg-bg-primary-soft p-2 shadow-lg",
        className,
      ].join(" ")}
      role="menu"
    >
      <ul className="flex flex-col gap-1.5">
        <DropdownItem href="/dashboard" icon={Lock} label="Dashboard" onClick={onItemClick} />
        <DropdownItem href="/settings/account" icon={User} label="Account" onClick={onItemClick} />
        <DropdownItem href="/settings" icon={SlidersHorizontal} label="Settings" onClick={onItemClick} />
        <DropdownItem href="/notifications" icon={Bell} label="Notifications" onClick={onItemClick} />
        <DropdownItem href="/help" icon={HelpCircle} label="Help center" onClick={onItemClick} />
        <SignOutItem onClick={onItemClick} />
      </ul>
    </div>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-sm p-2 text-sm font-medium leading-[14px] text-text-body transition-colors hover:bg-bg-tertiary-medium"
        role="menuitem"
      >
        <Icon className="size-4" aria-hidden />
        {label}
      </Link>
    </li>
  );
}

function SignOutItem({ onClick }: { onClick?: () => void }) {
  return (
    <li>
      <form action={logout}>
        <button
          type="submit"
          onClick={onClick}
          className="flex w-full items-center gap-1.5 rounded-sm p-2 text-sm font-medium leading-[14px] text-text-fg-danger transition-colors hover:bg-bg-tertiary-medium"
          role="menuitem"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </form>
    </li>
  );
}

