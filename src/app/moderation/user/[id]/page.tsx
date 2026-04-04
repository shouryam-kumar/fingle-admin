import { getUserDetails, getUserContent } from "@/lib/queries";
import { GlowCard } from "@/components/metric-card";
import { UserActions } from "@/components/user-actions";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [userDetails, userContent] = await Promise.all([
    getUserDetails(id),
    getUserContent(id),
  ]);

  if (!userDetails) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-white">User not found</h2>
        <a href="/moderation" className="text-purple-400 mt-4 inline-block">Back to Moderation</a>
      </div>
    );
  }

  const user = userDetails as any;
  const content = (userContent ?? []) as any[];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <a href="/moderation" className="text-gray-400 hover:text-white">&larr; Back</a>
        <h2 className="text-2xl font-bold text-white">User Details</h2>
      </div>

      {/* User Profile Card */}
      <GlowCard>
        <div className="flex items-start gap-6">
          {user.profile_pic ? (
            <img src={user.profile_pic} alt="" className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl text-purple-300">
              {(user.name ?? '?')[0]}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              {user.is_verified && <span className="text-blue-400 text-sm">Verified</span>}
              {user.is_suspended && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">SUSPENDED</span>
              )}
            </div>
            <p className="text-gray-400">@{user.username}</p>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            {user.bio && <p className="text-gray-300 text-sm mt-2">{user.bio}</p>}
            {user.suspension_reason && (
              <p className="text-red-400 text-sm mt-2">Suspension reason: {user.suspension_reason}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.followers_count}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.following_count}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.video_count}</p>
            <p className="text-xs text-gray-500">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.photo_count}</p>
            <p className="text-xs text-gray-500">Photos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.total_views}</p>
            <p className="text-xs text-gray-500">Total Views</p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Joined: {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {/* Admin Actions */}
        <UserActions userId={id} isSuspended={user.is_suspended} />
      </GlowCard>

      {/* User Content */}
      <GlowCard>
        <h3 className="text-lg font-semibold text-white mb-4">Content ({content.length} posts)</h3>
        {content.length === 0 ? (
          <p className="text-gray-500 text-sm">No content posted</p>
        ) : (
          <div className="space-y-2">
            {content.map((post: any) => (
              <div key={post.id} className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.thumbnail_url && (
                    <img src={post.thumbnail_url} alt="" className="w-12 h-12 rounded object-cover" />
                  )}
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                      {post.type}
                    </span>
                    <p className="text-sm text-gray-300 mt-1">
                      {post.content_text ? post.content_text.substring(0, 80) : 'No caption'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <UserActions userId={id} postId={post.id} postType={post.type} isDeleteAction />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
