"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

export function NewsletterSignupCard() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <aside className="rounded-base border border-border-default bg-bg-brand-softer p-5">
      <Mail className="size-6 text-text-fg-brand-strong" aria-hidden />
      <h3 className="mt-3 text-base font-semibold text-text-heading">Get the best of OptoMedEd</h3>
      <p className="mt-1 text-sm text-text-body">New clinical articles delivered to your inbox.</p>

      {submitted ? (
        <p className="mt-4 text-sm font-medium text-text-fg-success-strong">Thanks — we&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
          />
          <button
            type="submit"
            className="w-full rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
          >
            Subscribe
          </button>
        </form>
      )}
    </aside>
  );
}

