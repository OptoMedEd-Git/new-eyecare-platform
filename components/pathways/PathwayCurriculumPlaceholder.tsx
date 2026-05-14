import { BookOpen } from "lucide-react";

type Props = {
  moduleCount: number;
};

export function PathwayCurriculumPlaceholder({ moduleCount }: Props) {
  if (moduleCount === 0) {
    return (
      <section id="curriculum" className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-10 text-center">
        <BookOpen className="mx-auto size-10 text-text-muted" aria-hidden />
        <h2 className="mt-4 text-lg font-bold text-text-heading">This pathway is being built</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-body">Modules will appear here once they are authored and linked to courses, quizzes, and other content.</p>
      </section>
    );
  }

  return (
    <section id="curriculum" className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-10 text-center">
      <BookOpen className="mx-auto size-10 text-text-muted" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-text-heading">Modules coming soon</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-text-body">
        This pathway has {moduleCount} module{moduleCount === 1 ? "" : "s"} in the database. Step-by-step curriculum and linked content will appear here in a future update.
      </p>
    </section>
  );
}
