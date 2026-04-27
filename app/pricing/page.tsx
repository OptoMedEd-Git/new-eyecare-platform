import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center bg-white px-4 py-16 dark:bg-gray-900">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Pricing
        </h1>
        <p className="mt-4 text-lg text-text-body dark:text-gray-300">
          Transparent plans for individuals, practices, and institutions—so you
          can scale eye care education without surprises.
        </p>
        <p className="mt-6 text-sm font-medium uppercase tracking-wide text-brand">
          Coming soon
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-base font-medium text-blue-700 hover:text-blue-900 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
