import { ComingSoonPage } from "@/components/layout/ComingSoonPage";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <ComingSoonPage
      title="New post editor"
      description="The post authoring interface is coming soon. Check back shortly."
      showSignupCTA={false}
    />
  );
}

