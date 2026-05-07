import { BookOpen, GraduationCap, Layers, Route, Stethoscope, Eye } from "lucide-react";

type ToolItem = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
};

const TOOLS: readonly ToolItem[] = [
  {
    title: "Learning Pathways",
    description:
      "Structured progressions tailored to your role. Start where you are, build toward where you want to be.",
    icon: Route,
  },
  {
    title: "Microlearning Modules",
    description:
      "Bite-sized lessons under 10 minutes each. Learn one concept at a time, between patients or on your commute.",
    icon: BookOpen,
  },
  {
    title: "Case Studies",
    description:
      "Interactive cases that walk you through differential diagnosis and clinical decision-making.",
    icon: Stethoscope,
  },
  {
    title: "Flashcards",
    description:
      "Spaced repetition for the facts you need to retain — pharmacology, anatomy, key clinical pearls.",
    icon: Layers,
  },
  {
    title: "Media Gallery",
    description:
      "Curated images, videos, and clinical photos. Build your visual diagnostic library across slit-lamp, fundus, OCT, and more.",
    icon: Eye,
  },
  {
    title: "Courses",
    description:
      "Deep-dive modules covering core eye care topics with video, reading, and assessment built in.",
    icon: GraduationCap,
  },
] as const;

export function ToolsGrid() {
  return (
    <section
      id="tools"
      aria-labelledby="tools-heading"
      className="w-full scroll-mt-20 overflow-hidden bg-bg-primary-soft py-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        <header className="max-w-2xl">
          <h2
            id="tools-heading"
            className="text-3xl font-extrabold tracking-tight text-text-heading lg:text-4xl"
          >
            Comprehensive learning tools for eye care professionals
          </h2>
          <p className="mt-4 text-base leading-7 text-text-body lg:text-lg">
            Active learning tools designed for the way clinicians actually retain
            and apply knowledge.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12">
          {TOOLS.map((tool) => (
            <div key={tool.title} className="flex flex-col">
              <div className="flex size-12 items-center justify-center rounded-base bg-bg-brand-softer">
                <tool.icon className="size-6 text-text-fg-brand-strong" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold leading-tight tracking-tight text-text-heading">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-body">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
