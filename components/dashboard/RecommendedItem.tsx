import Link from "next/link";
import { BookOpen, ClipboardList, Compass, Stethoscope } from "lucide-react";

type Props = {
  item: {
    id: string;
    title: string;
    category: string;
    type: "Course" | "Pathway" | "Case" | "Quiz";
    estimatedMinutes: number;
  };
};

const TYPE_ICONS = {
  Course: BookOpen,
  Pathway: Compass,
  Case: Stethoscope,
  Quiz: ClipboardList,
} as const;

export function RecommendedItem({ item }: Props) {
  const Icon = TYPE_ICONS[item.type];

  return (
    <Link
      href="#"
      // SAMPLE: placeholder route — replace with real destinations when available.
      className="group flex items-start gap-3 rounded-sm p-2 transition-colors hover:bg-bg-secondary-soft"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-base bg-bg-brand-softer">
        <Icon className="size-4 text-text-fg-brand-strong" aria-hidden />
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <span className="text-xs font-medium text-text-fg-brand-strong">
          {item.type} · {item.estimatedMinutes} min
        </span>
        <span className="text-sm font-medium leading-tight text-text-heading group-hover:text-text-fg-brand-strong">
          {item.title}
        </span>
        <span className="text-xs text-text-muted">{item.category}</span>
      </div>
    </Link>
  );
}

