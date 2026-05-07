import { HomeBlogPostCard } from "@/components/blog/HomeBlogPostCard";
import { NewsletterSignupCard } from "@/components/blog/NewsletterSignupCard";
import { getFeaturedPosts } from "@/lib/blog/queries";

export async function FeaturedBlogSection() {
  const posts = await getFeaturedPosts(3);

  if (posts.length === 0) return null;

  return (
    <section className="bg-bg-secondary-soft py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-text-heading lg:text-4xl">
            From the OptoMedEd blog
          </h2>
          <p className="mb-8 text-base leading-7 text-text-body lg:text-lg">
            Practical clinical guides, case studies, and continuing education content written for eye care professionals
            at every stage of their career.
          </p>

          <div className="mt-8">
            <NewsletterSignupCard />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <HomeBlogPostCard
              key={post.id}
              post={{
                slug: post.slug,
                title: post.title,
                description: post.description,
                published_at: post.published_at ?? "",
                category: { name: post.category.name, slug: post.category.slug },
                author: post.author,
                read_time_minutes: post.reading_time_minutes ?? undefined,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

