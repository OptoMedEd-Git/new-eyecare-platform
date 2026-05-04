"use client";

import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface FaqEntry {
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqEntry[] = [
  {
    question: "Is OptoMedEd really free to use?",
    answer:
      "Yes. The core platform — courses, quizzes, flashcards, case studies, and reference content — is free for all users during early access. We may introduce premium features in the future, but everything you sign up for today will remain accessible.",
  },
  {
    question: "Who creates and reviews the content?",
    answer:
      "Content is developed and reviewed by practicing eye care professionals and clinical educators. Every module references current clinical guidelines and peer-reviewed evidence. We're transparent about content sources and update materials as practice standards evolve.",
  },
  {
    question: "Can I earn CE credits through OptoMedEd?",
    answer:
      "CE credit eligibility is in development. We're working toward accreditation with major optometric and ophthalmic CE bodies. Currently, completed courses generate certificates that document your learning, which some boards accept toward self-reported CE.",
  },
  {
    question: "Is OptoMedEd useful if I'm not an optometrist or ophthalmologist?",
    answer:
      "Yes. The platform serves the full eye care team — students, residents, technicians, opticians, vision scientists, and practitioners across both optometry and ophthalmology. Content adapts to your role and experience level.",
  },
  {
    question: "Can I use OptoMedEd on my phone or tablet?",
    answer:
      "Yes. The platform is responsive and works on any device with a modern web browser. A dedicated mobile app may come later, but the web experience is designed to work well on smaller screens.",
  },
  {
    question: "How is my data and progress handled?",
    answer:
      "Your account data is stored securely and never sold to third parties. We use your usage data only to personalize your learning experience and improve the platform. You can request your data or delete your account at any time from settings.",
  },
] as const;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <section
      className="w-full overflow-hidden bg-white dark:bg-gray-950"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-2xl bg-secondary p-8 lg:p-12">
            <header className="relative z-10 flex max-w-xl flex-col gap-6">
              <h2
                id="faq-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-[#101828] sm:text-4xl sm:leading-tight dark:text-white"
              >
                Frequently asked questions
              </h2>
              <p className="text-lg font-normal leading-7 text-text-body dark:text-gray-300">
                Common questions about the platform, content, and how OptoMedEd
                fits into your learning. Don&apos;t see your question? Get in
                touch.
              </p>
              <Link
                href="/contact"
                className="inline-flex w-fit items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium leading-5 text-text-body shadow-[0_1px_0.5px_0_rgba(29,41,61,0.02)] transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-950"
              >
                <MessageSquare
                  className="size-4 shrink-0 text-text-body transition-colors duration-200"
                  aria-hidden
                />
                Contact us
              </Link>
            </header>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;

              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <button
                    type="button"
                    id={`faq-trigger-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                    className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-all duration-200 sm:px-6 ${
                      isOpen
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/80"
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
                      <HelpCircle
                        className="mt-0.5 size-5 shrink-0 text-gray-500 transition-colors duration-200 sm:mt-0 dark:text-gray-400"
                        aria-hidden
                        strokeWidth={1.75}
                      />
                      <span
                        className={`text-base font-medium leading-6 ${
                          isOpen
                            ? "text-[#101828] dark:text-white"
                            : "text-text-body dark:text-gray-300"
                        }`}
                      >
                        {faq.question}
                      </span>
                    </span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                      strokeWidth={1.75}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={`faq-trigger-${index}`}
                        className="border-t border-gray-200 bg-white px-5 pb-5 pt-4 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <p className="text-base font-normal leading-6 text-text-body dark:text-gray-300">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
