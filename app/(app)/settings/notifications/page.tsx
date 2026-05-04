const cardClass =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900";

export default function NotificationsSettingsPage() {
  return (
    <section className={cardClass} aria-labelledby="notifications-settings-heading">
      <h2
        id="notifications-settings-heading"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        Notifications
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-body dark:text-gray-400">
        Email preferences and notification settings for content updates. Coming soon.
      </p>
    </section>
  );
}
