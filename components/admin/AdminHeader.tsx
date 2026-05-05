import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AdminHeaderProps = {
  user: {
    firstName: string;
    role: "admin" | "contributor";
  };
};

export function AdminHeader({ user }: AdminHeaderProps) {
  const roleLabel = user.role === "admin" ? "Admin" : "Contributor";

  return (
    <header className="border-b border-border-default bg-bg-primary-soft">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-1 py-[2px] pl-[2px] pr-[6px] no-underline hover:no-underline">
            <Image
              src="/logos/logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px] shrink-0"
              unoptimized
            />
            <span className="text-lg font-semibold text-text-heading">OptoMedEd</span>
          </Link>
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
            {roleLabel}
          </span>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-text-body transition-colors hover:text-text-heading"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
