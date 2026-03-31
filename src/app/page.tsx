import { getTotalUsers, getDAU, getMAU, getSignupTrend, getDAUTrend, getAvgSessionDuration, getContentStats, getCreatorRatio, getWoWGrowth, getSignupSources } from "@/lib/queries";
import { SignupChart, DAUChart, ContentPieChart } from "@/components/charts";
import { MetricCard, GlowCard } from "@/components/metric-card";

export const dynamic = "force-dynamic"; // Always fresh data;

export default async function OverviewPage() {
  const [totalUsers, dau, mau, signupTrend, dauTrend, avgSession, contentStats, creatorRatio, wowGrowth, signupSources] = await Promise.all([
    getTotalUsers(),
    getDAU(),
    getMAU(),
    getSignupTrend(30),
    getDAUTrend(30),
    getAvgSessionDuration(),
    getContentStats(),
    getCreatorRatio(),
    getWoWGrowth(),
    getSignupSources(),
  ]);

  const dauMauRatio = mau > 0 ? Math.round((dau / mau) * 100) : 0;
  const todaySignups = signupTrend[signupTrend.length - 1]?.count ?? 0;
  const yesterdaySignups = signupTrend[signupTrend.length - 2]?.count ?? 0;
  const signupTrend7d = yesterdaySignups > 0 ? Math.round(((todaySignups - yesterdaySignups) / yesterdaySignups) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-500 mt-1 text-sm">Real-time traction metrics for Fingle</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          subtitle="All registered accounts"
          icon="👥"
          gradient="bg-purple-600"
        />
        <MetricCard
          title="DAU"
          value={dau}
          subtitle="Active today"
          icon="📱"
          gradient="bg-blue-600"
        />
        <MetricCard
          title="Stickiness"
          value={`${dauMauRatio}%`}
          subtitle={`DAU/MAU — ${mau} monthly`}
          icon="🎯"
          gradient="bg-emerald-600"
          trend={dauMauRatio >= 20 ? dauMauRatio : undefined}
        />
        <MetricCard
          title="Avg Session"
          value={formatDuration(avgSession)}
          subtitle="Last 7 days"
          icon="⏱️"
          gradient="bg-amber-600"
        />
        <MetricCard
          title="WoW Growth"
          value={`${wowGrowth.growth >= 0 ? '+' : ''}${wowGrowth.growth}%`}
          subtitle={`${wowGrowth.thisWeek} this week vs ${wowGrowth.lastWeek} last`}
          icon="📈"
          gradient="bg-rose-600"
          trend={wowGrowth.growth}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-300">Daily Signups</h3>
            <span className="text-xs text-gray-600">Last 30 days</span>
          </div>
          <SignupChart data={signupTrend} />
        </GlowCard>

        <GlowCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-300">Daily Active Users</h3>
            <span className="text-xs text-gray-600">Last 30 days</span>
          </div>
          <DAUChart data={dauTrend} />
        </GlowCard>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content breakdown */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Content Breakdown</h3>
          <div className="space-y-3">
            <StatBar label="Photos" value={contentStats.photos} total={contentStats.total} color="bg-purple-500" />
            <StatBar label="Videos" value={contentStats.videos} total={contentStats.total} color="bg-indigo-500" />
            <StatBar label="Scribbles" value={contentStats.scribbles} total={contentStats.total} color="bg-emerald-500" />
            <StatBar label="Beats" value={contentStats.beats} total={contentStats.total} color="bg-amber-500" />
          </div>
          <p className="text-xs text-gray-600 mt-4">{contentStats.total} total posts</p>
        </GlowCard>

        {/* Creator ratio */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Creator vs Consumer</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1f1f2e"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeDasharray={`${creatorRatio.creatorPct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{creatorRatio.creatorPct}%</span>
                <span className="text-[10px] text-gray-500">creators</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-purple-400">{creatorRatio.creators} creators</span>
            <span className="text-gray-600">{creatorRatio.consumers} consumers</span>
          </div>
        </GlowCard>

        {/* Signup sources */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Signup Sources</h3>
          <ContentPieChart data={signupSources} />
        </GlowCard>

        {/* Quick facts */}
        <GlowCard className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Facts</h3>
          <div className="space-y-4">
            <QuickFact label="Signups today" value={todaySignups.toString()} />
            <QuickFact label="Total content posts" value={contentStats.total.toString()} />
            <QuickFact label="Active creators" value={creatorRatio.creators.toString()} />
            <QuickFact label="Avg session length" value={formatDuration(avgSession)} />
          </div>
        </GlowCard>
      </div>
    </div>
  );
}

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-medium text-gray-300">{value}</span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}
