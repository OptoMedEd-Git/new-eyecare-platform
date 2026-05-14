export type AdminViewMode = "admin" | "contributor" | "user";

export const VIEW_MODE_COOKIE = "ome_view_mode";
export const DEFAULT_VIEW_MODE: AdminViewMode = "admin";

export const VIEW_MODE_LABELS: Record<AdminViewMode, string> = {
  admin: "Admin view",
  contributor: "Contributor view",
  user: "User view",
};

export const VIEW_MODE_DESCRIPTIONS: Record<AdminViewMode, string> = {
  admin: "Full access — see and manage everything",
  contributor: "Preview the experience of a content contributor",
  user: "Preview the experience of an end user",
};

export function isValidViewMode(value: unknown): value is AdminViewMode {
  return value === "admin" || value === "contributor" || value === "user";
}

/**
 * Default dashboard for a preview mode after the view switcher changes mode.
 * Admin and contributor both use the admin shell (`/admin/dashboard`) for now.
 */
export function dashboardHrefForViewMode(mode: AdminViewMode): string {
  return mode === "user" ? "/dashboard" : "/admin/dashboard";
}
