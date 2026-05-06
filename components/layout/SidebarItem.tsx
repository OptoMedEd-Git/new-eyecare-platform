"use client";

import type { NavItem } from "@/lib/nav/nav-config";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export type SidebarItemProps = {
  item: NavItem;
  /** True when the sidebar is rendering in expanded mode (labels visible) */
  expanded: boolean;
  /** Current pathname for active-state detection */
  pathname: string;
  /** Optional click handler — used to close mobile drawer on navigation */
  onNavigate?: () => void;
};

export function SidebarItem({ item, expanded, pathname, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;

  const isActive = item.href
    ? pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
    : false;

  const hasChildren = Boolean(item.children?.length);

  const handleNavigate = () => {
    onNavigate?.();
  };

  if (expanded) {
    const rowClass = [
      "flex w-full items-center gap-1.5 rounded-base px-2 py-1.5 transition-colors",
      isActive
        ? "bg-bg-brand-softer text-text-fg-brand-strong"
        : "text-text-body hover:bg-bg-secondary-soft",
    ].join(" ");

    const inner = (
      <>
        <Icon
          className={`size-5 shrink-0 ${isActive ? "text-text-fg-brand-strong" : "text-text-body"}`}
          aria-hidden
          strokeWidth={2}
        />
        <span className="whitespace-nowrap text-base font-medium leading-6">{item.label}</span>
        {hasChildren ? (
          <ChevronDown className="ml-auto size-4 shrink-0 text-current" aria-hidden strokeWidth={2} />
        ) : null}
      </>
    );

    if (item.href) {
      return (
        <Link href={item.href} className={rowClass} onClick={handleNavigate}>
          {inner}
        </Link>
      );
    }

    return (
      <button type="button" className={rowClass} onClick={handleNavigate}>
        {inner}
      </button>
    );
  }

  const collapsedClass = [
    "mx-auto flex size-9 items-center justify-center rounded-base p-1.5 transition-colors",
    isActive
      ? "bg-bg-brand-softer text-text-fg-brand-strong"
      : "text-text-body hover:bg-bg-secondary-soft",
  ].join(" ");

  if (item.href) {
    return (
      <Link href={item.href} className={collapsedClass} title={item.label} onClick={handleNavigate}>
        <Icon
          className={`size-5 shrink-0 ${isActive ? "text-text-fg-brand-strong" : "text-text-body"}`}
          aria-hidden
          strokeWidth={2}
        />
      </Link>
    );
  }

  return (
    <button type="button" className={collapsedClass} title={item.label} onClick={handleNavigate}>
      <Icon
        className={`size-5 shrink-0 ${isActive ? "text-text-fg-brand-strong" : "text-text-body"}`}
        aria-hidden
        strokeWidth={2}
      />
    </button>
  );
}
