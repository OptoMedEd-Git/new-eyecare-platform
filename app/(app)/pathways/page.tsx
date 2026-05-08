import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PathwayBrowser } from "@/components/pathways/PathwayBrowser";
import { PathwayInProgressCard } from "@/components/pathways/PathwayInProgressCard";
import { SAMPLE_IN_PROGRESS_PATHWAYS, SAMPLE_PATHWAYS } from "@/lib/pathways/sample-data";

export default function PathwaysPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/dashboard" }, { label: "Pathways" }]} />

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-heading lg:text-4xl">Pathways</h1>
        <p className="mt-2 text-base leading-7 text-text-body">
          Structured learning tracks to build clinical confidence—one skill at a time.
        </p>
      </div>

      {/* Continue learning row */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-text-heading">Continue learning</h2>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SAMPLE_IN_PROGRESS_PATHWAYS.map((p) => (
            <PathwayInProgressCard key={p.id} pathway={p} />
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-10">
        <PathwayBrowser pathways={SAMPLE_PATHWAYS} />
      </div>
    </div>
  );
}
