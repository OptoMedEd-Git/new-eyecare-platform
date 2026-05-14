import {
  BookMarked,
  BookOpen,
  ClipboardList,
  FileCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  Hash,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Map,
  Newspaper,
  Route,
  Shield,
  Stethoscope,
  Tag,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { AdminViewMode } from "./view-mode";

export type NavItem = {
  /** Stable ID for keys/active-state matching */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon — component reference, not a string */
  icon: LucideIcon;
  /** Route this item links to. If the item is a parent with children, href is optional. */
  href?: string;
  /** Optional child items (renders as collapsible sub-section). Empty/undefined = leaf item. */
  children?: NavItem[];
  /** Optional badge (e.g., "Coming soon", or a count) */
  badge?: { label: string; tone?: "default" | "brand" };
  /**
   * Which preview modes show this item. Omit to default to all three.
   * Admin-only: `["admin"]`. Content authoring: `["admin", "contributor"]`.
   */
  visibleIn?: AdminViewMode[];
};

/** Member-facing nav (platform/learning pages) */
export const MEMBER_NAV_PRIMARY: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "pathways", label: "Pathways", icon: Route, href: "/pathways" },
  { id: "courses", label: "Courses", icon: GraduationCap, href: "/courses" },
  { id: "blog", label: "Blog", icon: Newspaper, href: "/blog" },
  { id: "quiz-bank", label: "Quiz Bank", icon: ClipboardList, href: "/quiz-bank" },
  { id: "flashcards", label: "Flashcards", icon: Layers, href: "/flashcards" },
  { id: "cases", label: "Cases", icon: Stethoscope, href: "/cases" },
  { id: "encyclopedia", label: "Encyclopedia", icon: BookOpen, href: "/encyclopedia" },
];

/** Admin-facing nav (CMS / management pages) */
export const ADMIN_NAV_PRIMARY: NavItem[] = [
  {
    id: "admin-dashboard",
    label: "Admin dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    visibleIn: ["admin"],
  },
  {
    id: "admin-pathways",
    label: "Pathways",
    icon: Map,
    href: "/admin/pathways",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-courses",
    label: "Courses",
    icon: GraduationCap,
    href: "/admin/courses",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-cases",
    label: "Cases",
    icon: Stethoscope,
    href: "/admin/cases",
    visibleIn: ["admin"],
  },
  {
    id: "admin-quiz-bank",
    label: "Quiz bank",
    icon: ClipboardList,
    href: "/admin/quiz-bank",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-flashcards",
    label: "Flashcards",
    icon: BookMarked,
    href: "/admin/flashcards",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-microlearning",
    label: "Microlearning",
    icon: Zap,
    href: "/admin/microlearning",
    visibleIn: ["admin"],
  },
  {
    id: "admin-posts",
    label: "Blog",
    icon: FileText,
    href: "/admin/blog",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-encyclopedia",
    label: "Encyclopedia",
    icon: BookOpen,
    href: "/admin/encyclopedia",
    visibleIn: ["admin"],
  },
  {
    id: "admin-resources",
    label: "Resources",
    icon: FolderOpen,
    href: "/admin/resources",
    visibleIn: ["admin"],
  },
  {
    id: "admin-categories",
    label: "Categories",
    icon: Tag,
    href: "/admin/categories",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-tags",
    label: "Tags",
    icon: Hash,
    href: "/admin/tags",
    visibleIn: ["admin", "contributor"],
  },
  {
    id: "admin-users",
    label: "Users",
    icon: Users,
    href: "/admin/users",
    visibleIn: ["admin"],
  },
];

/** Shared secondary nav (below divider) — same for all users */
export const SECONDARY_NAV: NavItem[] = [
  { id: "privacy", label: "Privacy policy", icon: Shield, href: "/privacy" },
  { id: "terms", label: "Terms of use", icon: FileCheck, href: "/terms" },
  { id: "help", label: "Help center", icon: LifeBuoy, href: "/help" },
  { id: "contact", label: "Contact us", icon: Mail, href: "/contact" },
];
