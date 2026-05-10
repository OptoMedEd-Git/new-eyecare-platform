import {
  BookOpen,
  ClipboardList,
  FileCheck,
  FileText,
  GraduationCap,
  Hash,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Newspaper,
  Route,
  Shield,
  Stethoscope,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  { id: "admin-posts", label: "Posts", icon: FileText, href: "/admin/blog" },
  { id: "admin-courses", label: "Courses", icon: GraduationCap, href: "/admin/courses" },
  { id: "admin-quiz-bank", label: "Quiz bank", icon: ClipboardList, href: "/admin/quiz-bank" },
  { id: "admin-categories", label: "Categories", icon: Tag, href: "/admin/categories" },
  { id: "admin-tags", label: "Tags", icon: Hash, href: "/admin/tags" },
  { id: "admin-users", label: "Users", icon: Users, href: "/admin/users" },
];

/** Shared secondary nav (below divider) — same for all users */
export const SECONDARY_NAV: NavItem[] = [
  { id: "privacy", label: "Privacy policy", icon: Shield, href: "/privacy" },
  { id: "terms", label: "Terms of use", icon: FileCheck, href: "/terms" },
  { id: "help", label: "Help center", icon: LifeBuoy, href: "/help" },
  { id: "contact", label: "Contact us", icon: Mail, href: "/contact" },
];
