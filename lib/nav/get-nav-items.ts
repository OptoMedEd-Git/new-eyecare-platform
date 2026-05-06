import { ADMIN_NAV_PRIMARY, MEMBER_NAV_PRIMARY, SECONDARY_NAV, type NavItem } from "./nav-config";

export type NavContext = {
  /** User role from profiles table */
  role: "admin" | "contributor" | "member" | null;
  /** Current pathname — used to decide admin vs. member context for users with admin access */
  pathname: string;
};

export type ResolvedNav = {
  primary: NavItem[];
  secondary: NavItem[];
};

/**
 * Returns the nav items for the current user + page context.
 *
 * Logic per the project's strict role separation policy:
 * - If user is on an /admin/* route AND has admin/contributor role: show ADMIN nav
 * - Otherwise: show MEMBER nav
 *
 * This means an admin viewing /dashboard sees member nav; the same admin viewing
 * /admin/blog sees admin nav. They get the right context for where they are.
 *
 * Members never see admin nav, even if they somehow land on an admin URL (the
 * route-level role gate redirects them, so this is defense-in-depth).
 */
export function getNavItems({ role, pathname }: NavContext): ResolvedNav {
  const isAdminContext = pathname.startsWith("/admin");
  const hasAdminAccess = role === "admin" || role === "contributor";

  if (isAdminContext && hasAdminAccess) {
    return {
      primary: filterAdminNavByRole(ADMIN_NAV_PRIMARY, role as "admin" | "contributor"),
      secondary: SECONDARY_NAV,
    };
  }
  return { primary: MEMBER_NAV_PRIMARY, secondary: SECONDARY_NAV };
}

/**
 * Filter admin nav items by role. Contributors don't see Users management; only admins do.
 * Used inside getNavItems when isAdminContext + hasAdminAccess.
 */
export function filterAdminNavByRole(items: NavItem[], role: "admin" | "contributor"): NavItem[] {
  if (role === "admin") return items;
  return items.filter((item) => item.id !== "admin-users");
}
