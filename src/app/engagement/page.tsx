import { getEngagementTrend } from "@/lib/queries";
import { EngagementChart } from "@/components/charts";
import { MetricCard, GlowCard } from "@/components/metric-card";

export const dynamic = "force-dynamic"; // Always fresh data;

export default async function EngagementPage() {
  const engagementTrend = await getEngagementTrend(14);

  const totalReactions = engagementTrend.reduce((s, d) => s + d.reactions, 0);
  const totalViews = engagementTrend.reduce((s, d) => s + d.views, 0);
  const totalMessages = engagementTrend.reduce((s, d) => s + d.messages, 0);
  const avgReactionsPerDay = Math.round(totalReactions / 14);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Engagement</h2>
        <p className="text-gray-500 mt-1 text-sm">User interaction and activity metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Reactions"
          value={totalReactions}
          subtitle="Last 14 days"
          icon="❤️"
          gradient="bg-purple-600"
        />
        <MetricCard
          title="Video Views"
          value={totalViews}
          subtitle="Last 14 days"
          icon="👀"
          gradient="bg-blue-600"
        />
        <MetricCard
          title="Messages"
          value={totalMessages}
          subtitle="Last 14 days"
          icon="💬"
          gradient="bg-emerald-600"
        />
        <MetricCard
          title="Avg Reactions/Day"
          value={avgReactionsPerDay}
          subtitle="14-day average"
          icon="📈"
          gradient="bg-amber-600"
        />
      </div>

      <GlowCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-300">Daily Engagement Breakdown</h3>
          <span className="text-xs text-gray-600">Last 14 days</span>
        </div>
        <EngagementChart data={engagementTrend} />
      </GlowCard>
    </div>
  );
}
