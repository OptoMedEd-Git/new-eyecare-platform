import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  FlaskConical,
  Glasses,
  GraduationCap,
  Scissors,
  Stethoscope,
  Wrench,
} from "lucide-react";

type Persona = {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
};

const PERSONAS: readonly Persona[] = [
  {
    id: "optometry-students",
    title: "Optometry students",
    description:
      "Build a strong clinical foundation before graduation. Master core topics, prepare for board exams, and get comfortable with patient cases before you see your first one.",
    Icon: GraduationCap,
  },
  {
    id: "medical-students",
    title: "Medical students",
    description:
      "Explore eye care during your clinical rotations. Learn the ophthalmologic exam, recognize ocular emergencies, and decide if ophthalmology is your path.",
    Icon: Stethoscope,
  },
  {
    id: "optometry-residents",
    title: "Optometry residents",
    description:
      "Deepen your specialty knowledge during residency. Access advanced modules, complex case studies, and content aligned with your training curriculum.",
    Icon: BookOpen,
  },
  {
    id: "ophthalmology-residents",
    title: "Ophthalmology residents",
    description:
      "Surgical and medical content tailored to ophthalmology training. From posterior segment to oculoplastics, structured learning that fits your busy schedule.",
    Icon: Scissors,
  },
  {
    id: "practicing",
    title: "Practicing optometrists & ophthalmologists",
    description:
      "Stay current with evolving evidence and earn CE credits. Quick reference for conditions you see less often, deep dives for areas you want to specialize in.",
    Icon: Briefcase,
  },
  {
    id: "researchers",
    title: "Researchers and vision scientists",
    description:
      "Reference the clinical context behind your research. Stay informed on practice-changing studies and translational developments in vision science.",
    Icon: FlaskConical,
  },
  {
    id: "technicians",
    title: "Optometric & ophthalmic technicians",
    description:
      "Master the technical side of eye care. From basic procedures to advanced diagnostic equipment, content that builds your skills and confidence in the exam room.",
    Icon: Wrench,
  },
  {
    id: "opticians",
    title: "Opticians",
    description:
      "Sharpen your knowledge of optical principles, frame fitting, and lens technology. Stay ahead of evolving standards and patient expectations.",
    Icon: Glasses,
  },
] as const;

function PersonaCard({ persona }: { persona: Persona }) {
  const { Icon, title, description } = persona;
  return (
    <article className="group flex h-full min-w-0 flex-col rounded-xl border border-gray-200 bg-secondary p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/60 dark:hover:border-gray-600">
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors duration-200 group-hover:text-brand dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:text-brand">
          <Icon className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 border-l border-gray-200 pl-3.5 dark:border-gray-600">
          <h3 className="text-xl font-bold leading-none text-[#101828] dark:text-white">
            {title}
          </h3>
          <p className="mt-2.5 text-sm font-normal leading-5 text-text-body dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

export function WhoItsFor() {
  return (
    <section
      className="w-full overflow-hidden border-y border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950"
      aria-labelledby="who-its-for-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <header className="mb-8 flex flex-col gap-3">
          <h2
            id="who-its-for-heading"
            className="text-3xl font-semibold leading-9 text-[#101828] sm:text-4xl dark:text-white"
          >
            Who it&apos;s for
          </h2>
          <p className="max-w-3xl text-lg font-normal leading-7 text-text-body dark:text-gray-300">
            Wherever you are in your career, OptoMedEd has a path for you
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6">
          {PERSONAS.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>
    </section>
  );
}
