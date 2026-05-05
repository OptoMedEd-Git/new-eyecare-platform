import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-secondary">
      <header className="border-b border-border-default bg-bg-primary-soft">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex shrink-0 items-center gap-1 py-[2px] pl-[2px] pr-[6px] no-underline hover:no-underline">
            <Image
              src="/logos/logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px] shrink-0"
              unoptimized
            />
            <span className="text-2xl font-semibold text-text-heading">OptoMedEd</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-text-body transition-colors hover:text-text-heading"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 py-12 md:py-24">
        {children}
      </main>
    </div>
  );
}
