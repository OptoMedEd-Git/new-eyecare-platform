import { Hero } from "@/components/landing/Hero";
import { ToolsGrid } from "@/components/landing/ToolsGrid";
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
    <>
      <Hero />

      <ToolsGrid />

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
            <article
              key={index}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                  {post.category}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-6">
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
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}