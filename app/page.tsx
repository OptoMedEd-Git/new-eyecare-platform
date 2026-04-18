"use client";

import { Button, Card } from "flowbite-react";
import Link from "next/link";

const featuredPosts = [
  {
    title: "Understanding Diabetic Retinopathy: Early Detection Strategies",
    excerpt:
      "Diabetic retinopathy is a leading cause of vision loss. Learn the warning signs, screening protocols, and latest treatment approaches for your patients.",
    category: "Ocular Disease",
    author: "Dr. Sarah Chen",
    readTime: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
    href: "#",
  },
  {
    title: "Managing Pediatric Myopia Progression",
    excerpt:
      "Recent clinical trials have revolutionized how we approach myopia management in children. A comprehensive review of current options.",
    category: "Pediatrics",
    author: "Dr. James Liu",
    readTime: "7 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80",
    href: "#",
  },
  {
    title: "OCT Interpretation for Beginners",
    excerpt:
      "A step-by-step guide to reading optical coherence tomography scans with confidence. Includes annotated real-world case examples.",
    category: "Clinical Skills",
    author: "Dr. Priya Patel",
    readTime: "12 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    href: "#",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <section className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Expert eye care education,
              <br />
              <span className="text-blue-700 dark:text-blue-400">
                for every stage of your career
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Courses, clinical cases, quizzes, and resources built by eye care
              professionals, for eye care professionals.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" color="blue">
                Get started free
              </Button>
              <Button size="xl" color="light">
                Browse courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Latest from the blog
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Clinical insights and education from our contributors
            </p>
          </div>
          <Link
            href="#"
            className="text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-shadow hover:shadow-lg"
              renderImage={() => (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                    {post.category}
                  </span>
                </div>
              )}
            >
              <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {post.title}
              </h3>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {post.author}
                  </span>
                  <span className="mx-1">·</span>
                  <span>{post.readTime}</span>
                </div>
                <Link
                  href={post.href}
                  className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
                >
                  Read article →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-500 sm:px-6 lg:px-8 dark:text-gray-400">
          © 2026 OptoMedEd. Built for eye care professionals.
        </div>
      </footer>
    </div>
  );
}