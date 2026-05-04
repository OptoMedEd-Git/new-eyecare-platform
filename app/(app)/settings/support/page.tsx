const cardClass =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900";

export default function SupportSettingsPage() {
  return (
    <section className={cardClass} aria-labelledby="support-settings-heading">
      <h2
        id="support-settings-heading"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        Support
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-body dark:text-gray-400">
        Help articles, contact support, and feedback options. Coming soon.
      </p>
    </section>
  );
}
