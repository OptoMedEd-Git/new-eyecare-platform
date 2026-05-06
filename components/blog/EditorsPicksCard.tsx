import Link from "next/link";

type EditorsPick = {
  href: string;
  title: string;
  category: string;
};

// PLACEHOLDER: dummy data. Wire to real related posts in a future session.
const DUMMY_PICKS: EditorsPick[] = [
  { href: "#", title: "Reading OCT scans systematically", category: "Posterior segment" },
  { href: "#", title: "Anterior chamber angle assessment", category: "Anterior segment" },
  { href: "#", title: "Differentiating optic neuritis from AION", category: "Neuro-ophthalmology" },
];

export function EditorsPicksCard() {
  return (
    <aside className="rounded-base border border-border-default bg-bg-primary-soft p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Editor&apos;s picks</h3>
      <ul className="mt-4 flex flex-col gap-4">
        {DUMMY_PICKS.map((pick) => (
          <li key={pick.title}>
            <Link href={pick.href} className="group flex flex-col gap-1">
              <span className="text-xs font-medium text-text-fg-brand-strong">{pick.category}</span>
              <span className="text-sm font-medium text-text-heading transition-colors group-hover:text-text-fg-brand-strong">
                {pick.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

