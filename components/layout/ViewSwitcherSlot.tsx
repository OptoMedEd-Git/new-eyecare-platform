"use client";

import { useSidebar } from "@/components/layout/SidebarProvider";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import type { AdminViewMode } from "@/lib/nav/view-mode";

type Props = { currentMode: AdminViewMode };

export function ViewSwitcherSlot({ currentMode }: Props) {
  const { isExpanded } = useSidebar();
  if (!isExpanded) return null;
  return (
    <div className="mb-2">
      <ViewSwitcher currentMode={currentMode} />
    </div>
  );
}
