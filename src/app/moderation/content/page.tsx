import { getAllContent } from "@/lib/queries";
import { GlowCard } from "@/components/metric-card";
import { ContentDeleteButton } from "@/components/content-delete-button";

export const dynamic = "force-dynamic";

export default async function ContentModerationPage() {
  const content = (await getAllContent(100, 0)) as any[];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <a href="/moderation" className="text-gray-400 hover:text-white">&larr; Back</a>
        <div>
          <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
          <p className="text-gray-500 mt-1 text-sm">Browse and moderate all posts across all users</p>
        </div>
      </div>

      <GlowCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">All Content ({content.length} posts)</h3>
        </div>

        {content.length === 0 ? (
          <p className="text-gray-500 text-sm">No content posted yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map((post: any) => (
              <div key={post.id} className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                {/* Thumbnail */}
                {post.thumbnail_url ? (
                  <div className="relative">
                    <img src={post.thumbnail_url} alt="" className="w-full h-48 object-cover" />
                    <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-black/60 text-white uppercase">
                      {post.type}
                    </span>
                    {post.views > 0 && (
                      <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-black/60 text-white">
                        {post.views} views
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-32 bg-gray-700/30 flex items-center justify-center">
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                      {post.type}
                    </span>
                  </div>
                )}

                {/* Content info */}
                <div className="p-3">
                  {/* User info */}
                  <div className="flex items-center gap-2 mb-2">
                    {post.profile_pic ? (
                      <img src={post.profile_pic} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-xs text-purple-300">
                        {(post.user_name ?? '?')[0]}
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-white">{post.user_name}</span>
                      <span className="text-xs text-gray-500 ml-1">@{post.username}</span>
                    </div>
                  </div>

                  {/* Caption */}
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {post.content_text || 'No caption'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <a href={`/moderation/user/${post.user_id}`} className="text-xs text-purple-400 hover:text-purple-300">
                        Profile
                      </a>
                      <ContentDeleteButton postId={post.id} postType={post.type} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
