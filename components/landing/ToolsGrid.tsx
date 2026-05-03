import Image from "next/image";

type ToolCard = {
  id: string;
  title: string;
  description: string;
  /** Public path after you export assets to `public/images/tools/`. */
  imageSrc: string;
  imageAlt: string;
  /** Desktop (lg) column span within a 6-column grid: row1 → 3+3, rows 2–3 → 2+2+2. */
  lgColSpan: 2 | 3;
};

const TOOL_CARDS: readonly ToolCard[] = [
  {
    id: "learning-pathways",
    title: "Learning Pathways",
    description:
      "Structured progressions tailored to your role. Start where you are, build toward where you want to be.",
    imageSrc: "/images/tools/learning-pathways.png",
    imageAlt:
      "Illustration for Learning Pathways: structured learning journey and progression milestones.",
    lgColSpan: 3,
  },
  {
    id: "microlearning-modules",
    title: "Microlearning Modules",
    description:
      "Bite-sized lessons under 10 minutes each. Learn one concept at a time, between patients or on your commute.",
    imageSrc: "/images/tools/microlearning-modules.png",
    imageAlt:
      "Illustration for Microlearning Modules: short lesson units and quick study sessions.",
    lgColSpan: 3,
  },
  {
    id: "case-studies",
    title: "Case Studies",
    description:
      "Interactive cases that walk you through differential diagnosis and clinical decision-making.",
    imageSrc: "/images/tools/case-studies.png",
    imageAlt:
      "Illustration for Case Studies: clinical case review and diagnostic reasoning.",
    lgColSpan: 2,
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description:
      "Spaced repetition for the facts you need to retain — pharmacology, anatomy, key clinical pearls.",
    imageSrc: "/images/tools/flashcards.png",
    imageAlt:
      "Illustration for Flashcards: spaced repetition and memorization cards.",
    lgColSpan: 2,
  },
  {
    id: "media-gallery",
    title: "Media Gallery",
    description:
      "Curated images, videos, and clinical photos. Build your visual diagnostic library across slit-lamp, fundus, OCT, and more.",
    imageSrc: "/images/tools/media-gallery.png",
    imageAlt:
      "Illustration for Media Gallery: clinical imaging and educational media.",
    lgColSpan: 2,
  },
  {
    id: "courses",
    title: "Courses",
    description:
      "Deep-dive modules covering core eye care topics with video, reading, and assessment built in.",
    imageSrc: "/images/tools/courses.png",
    imageAlt: "Illustration for Courses: structured course modules and assessments.",
    lgColSpan: 2,
  },
  {
    id: "question-bank",
    title: "Question Bank",
    description:
      "Active recall practice with high-yield clinical scenarios. Test what you know, surface what you don't.",
    imageSrc: "/images/tools/question-bank.png",
    imageAlt:
      "Illustration for Question Bank: practice questions and clinical scenarios.",
    lgColSpan: 2,
  },
  {
    id: "encyclopedia",
    title: "Encyclopedia",
    description:
      "Searchable, evidence-based reference for the conditions and concepts you encounter daily.",
    imageSrc: "/images/tools/encyclopedia.png",
    imageAlt:
      "Illustration for Encyclopedia: searchable reference and knowledge base.",
    lgColSpan: 2,
  },
] as const;

function lgColSpanClass(span: 2 | 3) {
  return span === 3 ? "lg:col-span-3" : "lg:col-span-2";
}

function ToolCard({ card }: { card: ToolCard }) {
  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${lgColSpanClass(card.lgColSpan)}`}
    >
      <div className="flex min-h-[140px] flex-1 flex-col items-center justify-center pb-5">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          width={280}
          height={180}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="h-auto max-h-[180px] w-full max-w-[280px] object-contain"
        />
      </div>
      <h3 className="text-center text-lg font-semibold leading-7 text-[#101828] dark:text-white">
        {card.title}
      </h3>
      <p className="mt-3 text-center text-base font-normal leading-6 text-text-body dark:text-gray-300">
        {card.description}
      </p>
    </article>
  );
}

export function ToolsGrid() {
  return (
    <section
      id="tools"
      aria-labelledby="tools-heading"
      className="w-full scroll-mt-20 overflow-hidden bg-secondary dark:bg-gray-900/40"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <header className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <h2
            id="tools-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-[#101828] sm:text-4xl dark:text-white"
          >
            Comprehensive learning tools for eye care professionals
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-600 sm:text-xl dark:text-gray-300">
            Active learning tools designed for the way clinicians actually retain
            and apply knowledge.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          {TOOL_CARDS.map((card) => (
            <ToolCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
