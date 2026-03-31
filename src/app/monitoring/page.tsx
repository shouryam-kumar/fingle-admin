import { getDatabaseStats, getSupabaseHealth, getStorageBuckets } from "@/lib/queries";
import { MetricCard, GlowCard } from "@/components/metric-card";

export const dynamic = "force-dynamic"; // Always fresh data; // Refresh every minute

export default async function MonitoringPage() {
  const [dbStats, health, buckets] = await Promise.all([
    getDatabaseStats(),
    getSupabaseHealth(),
    getStorageBuckets(),
  ]);

  const totalRows = dbStats.reduce((s, t) => s + t.rows, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">System Health</h2>
        <p className="text-gray-500 mt-1 text-sm">Database stats, API latency, and storage monitoring</p>
      </div>

      {/* Health indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlowCard className="text-center">
          <div className={`w-4 h-4 rounded-full mx-auto mb-3 ${health.status === 'healthy' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/30' : 'bg-red-400 shadow-lg shadow-red-400/30'}`} />
          <p className="text-xs text-gray-500 uppercase tracking-wider">Supabase API</p>
          <p className={`text-2xl font-bold mt-1 ${health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
            {health.status === 'healthy' ? 'Healthy' : 'Down'}
          </p>
          <p className="text-xs text-gray-600 mt-1">{health.latency}ms latency</p>
        </GlowCard>

        <MetricCard
          title="Total DB Rows"
          value={totalRows}
          subtitle={`Across ${dbStats.length} tables`}
          icon="🗄️"
          gradient="bg-blue-600"
        />

        <MetricCard
          title="Storage Buckets"
          value={buckets.length}
          subtitle={`${buckets.filter(b => b.public).length} public, ${buckets.filter(b => !b.public).length} private`}
          icon="📦"
          gradient="bg-purple-600"
        />
      </div>

      {/* Database table sizes */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Database Tables</h3>
        <div className="space-y-2">
          {dbStats.map((table) => {
            const pct = totalRows > 0 ? (table.rows / totalRows) * 100 : 0;
            return (
              <div key={table.table} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-400 group-hover:text-gray-200 transition-colors">{table.table}</span>
                  <span className="text-xs font-medium text-gray-500">{table.rows.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${Math.max(pct, 0.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* Storage buckets */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Storage Buckets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {buckets.map((bucket) => (
            <div key={bucket.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">📦</span>
                <span className="text-xs font-mono text-gray-300 truncate">{bucket.name}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${bucket.public ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {bucket.public ? 'Public' : 'Private'}
              </span>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* API Latency */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">API Response Time</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-16 bg-white/[0.02] rounded-xl flex items-center justify-center">
              <span className={`text-4xl font-bold font-mono ${health.latency < 200 ? 'text-emerald-400' : health.latency < 500 ? 'text-amber-400' : 'text-red-400'}`}>
                {health.latency}
              </span>
              <span className="text-sm text-gray-600 ml-1">ms</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>{'< 200ms'} = <span className="text-emerald-400">Excellent</span></p>
            <p>{'< 500ms'} = <span className="text-amber-400">Good</span></p>
            <p>{'> 500ms'} = <span className="text-red-400">Slow</span></p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
