import { ADMIN_NAV_PRIMARY, MEMBER_NAV_PRIMARY, SECONDARY_NAV, type NavItem } from "./nav-config";
import type { AdminViewMode } from "./view-mode";

export type NavContext = {
  /** User role from profiles table */
  role: "admin" | "contributor" | "member" | null;
  /**
   * Retained for callers; **not** used for primary nav selection (view mode drives admin vs member).
   */
  pathname: string;
  /**
   * Effective UI preview mode. Admins: from cookie. Contributors: always "contributor".
   * Members: always "user".
   */
  viewMode: AdminViewMode;
};

export type ResolvedNav = {
  primary: NavItem[];
  secondary: NavItem[];
};

/** Filter nav items (and nested children) by preview mode. */
export function filterNavItemsByViewMode(items: NavItem[], viewMode: AdminViewMode): NavItem[] {
  const allModes: AdminViewMode[] = ["admin", "contributor", "user"];
  return items
    .filter((item) => {
      const visibleIn = item.visibleIn ?? allModes;
      return visibleIn.includes(viewMode);
    })
    .map((item) => {
      if (!item.children?.length) return item;
      const children = filterNavItemsByViewMode(item.children, viewMode);
      return children.length ? { ...item, children } : { ...item, children: undefined };
    });
}

/**
 * Primary nav is driven by **role + viewMode**, not pathname.
 *
 * - Members: member primary + secondary (`user` filter).
 * - Contributors: admin CMS primary (contributor `visibleIn`) everywhere — not admins, no view switcher.
 * - Admins + user preview: member nav (admin previewing learner UX).
 * - Admins + admin or contributor preview: admin CMS primary filtered by `viewMode` (strict replacement, not merged with member).
 */
export function getNavItems({ role, pathname, viewMode }: NavContext): ResolvedNav {
  void pathname; // Kept on NavContext for callers; primary nav is view-mode-driven, not pathname-driven.
  if (role === "member" || role === null) {
    return {
      primary: filterNavItemsByViewMode(MEMBER_NAV_PRIMARY, "user"),
      secondary: filterNavItemsByViewMode(SECONDARY_NAV, "user"),
    };
  }

  if (role === "contributor") {
    return {
      primary: filterNavItemsByViewMode(ADMIN_NAV_PRIMARY, "contributor"),
      secondary: filterNavItemsByViewMode(SECONDARY_NAV, "contributor"),
    };
  }

  if (role === "admin" && viewMode === "user") {
    return {
      primary: filterNavItemsByViewMode(MEMBER_NAV_PRIMARY, "user"),
      secondary: filterNavItemsByViewMode(SECONDARY_NAV, "user"),
    };
  }

  return {
    primary: filterNavItemsByViewMode(ADMIN_NAV_PRIMARY, viewMode),
    secondary: filterNavItemsByViewMode(SECONDARY_NAV, viewMode),
  };
}
