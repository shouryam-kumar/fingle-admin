import { GlowCard } from "@/components/metric-card";
import { ContentBrowser } from "@/components/content-browser";

export const dynamic = "force-dynamic";

export default function ContentModerationPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <a href="/moderation" className="text-gray-400 hover:text-white">&larr; Back</a>
        <div>
          <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
          <p className="text-gray-500 mt-1 text-sm">Search posts by username or load recent content</p>
        </div>
      </div>

      <GlowCard>
        <ContentBrowser />
      </GlowCard>
    </div>
  );
}
