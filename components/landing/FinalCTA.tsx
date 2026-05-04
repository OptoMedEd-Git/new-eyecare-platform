import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const BG_IMAGE = "/images/hero/optometrist-exam2.jpg";

/** Matches Figma Jumbotron overlay (node I82:78969): rgba(17,25,40,0.7). */
const OVERLAY_CLASS = "bg-[rgba(17,25,40,0.7)]";

export function FinalCTA() {
  return (
    <section
      className="relative w-full overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={BG_IMAGE}
          alt="Optometrist conducting eye examination with phoropter"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
        />
        <div className={`absolute inset-0 ${OVERLAY_CLASS}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2
            id="final-cta-heading"
            className="text-4xl font-extrabold leading-none tracking-[-0.6px] text-white sm:text-5xl lg:text-[60px] lg:leading-[60px]"
          >
            Ready to advance your eye care education?
          </h2>
          <p className="max-w-3xl text-lg font-normal leading-normal text-gray-400 sm:text-xl">
            Join eye care professionals already learning with OptoMedEd. Free to
            start, free to keep using.
          </p>
          <Link
            href="/signup"
            className="inline-flex min-h-11 min-w-44 items-center justify-center gap-2 self-center rounded-lg bg-brand px-5 py-3 text-base font-medium leading-normal text-brand-foreground shadow-sm transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(17,25,40,0.85)]"
          >
            Get started
            <ArrowRight className="size-4 shrink-0 transition-colors duration-200" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
