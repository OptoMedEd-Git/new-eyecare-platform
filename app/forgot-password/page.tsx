import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Forgot Password
        </h1>
        <p className="mt-4 text-base leading-6 text-text-body">
          Password reset is coming soon. For now, please make sure you&apos;re using the correct email and password.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm font-medium text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

