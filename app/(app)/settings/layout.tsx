import { Breadcrumb } from "@/components/layout/Breadcrumb";

import { SettingsTabsNav } from "./SettingsTabsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Settings" },
        ]}
      />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Settings
      </h1>
      <div className="mt-6">
        <SettingsTabsNav notificationUnreadCount={0} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
