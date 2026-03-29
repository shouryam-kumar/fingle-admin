import { getTopFollowed, getTopCreators, getSignupSources } from "@/lib/queries";
import { ContentPieChart } from "@/components/charts";
import { GlowCard } from "@/components/metric-card";

export const revalidate = 300;

export default async function UsersPage() {
  const [topFollowed, topCreators, signupSources] = await Promise.all([
    getTopFollowed(10),
    getTopCreators(10),
    getSignupSources(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <p className="text-gray-500 mt-1 text-sm">Top users, leaderboards, and signup sources</p>
      </div>

      {/* Signup Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Signup Sources</h3>
          <ContentPieChart data={signupSources} />
        </GlowCard>

        {/* Most Followed */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Most Followed</h3>
          <div className="space-y-3">
            {topFollowed.map((user: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-xs font-bold text-gray-600 w-5">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
                  {user.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500">@{user.username}</p>
                </div>
                <span className="text-xs font-semibold text-purple-400">{user.followers}</span>
              </div>
            ))}
            {topFollowed.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No follow data yet</p>}
          </div>
        </GlowCard>

        {/* Top Creators */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Creators</h3>
          <div className="space-y-3">
            {topCreators.map((user: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-xs font-bold text-gray-600 w-5">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300">
                  {user.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500">@{user.username}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{user.posts} posts</span>
              </div>
            ))}
            {topCreators.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No creators yet</p>}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
