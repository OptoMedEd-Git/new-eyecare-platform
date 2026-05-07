import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Hero } from "@/components/landing/Hero";
import { ToolsGrid } from "@/components/landing/ToolsGrid";
import { WhoItsFor } from "@/components/landing/WhoItsFor";
import { FeaturedBlogSection } from "@/components/marketing/FeaturedBlogSection";

export default function Home() {
  return (
    <>
      <Hero />

      <ToolsGrid />

      <WhoItsFor />

      <HowItWorks />

      <FAQ />

      <FeaturedBlogSection />

      <FinalCTA />
    </>
  );
}