import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  firstName: string;
};

export function DashboardHeader({ firstName }: Props) {
  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-heading lg:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-base leading-7 text-text-body">
          Here&apos;s what&apos;s happening with your learning today.
        </p>
      </div>
    </div>
  );
}

