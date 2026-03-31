import { getDeviceBreakdown, getVersionAdoption } from "@/lib/queries";
import { ContentPieChart } from "@/components/charts";
import { MetricCard, GlowCard } from "@/components/metric-card";

export const dynamic = "force-dynamic"; // Always fresh data;

export default async function DevicesPage() {
  const [devices, versions] = await Promise.all([
    getDeviceBreakdown(),
    getVersionAdoption(),
  ]);

  const totalSessions = devices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Devices & Versions</h2>
        <p className="text-gray-500 mt-1 text-sm">Platform breakdown and app version adoption</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device breakdown */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Platform Distribution</h3>
          {devices.length > 0 ? (
            <ContentPieChart data={devices} />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-600 text-sm">
              No device data yet — sessions will populate this
            </div>
          )}
          <p className="text-xs text-gray-600 text-center mt-2">{totalSessions} total sessions tracked</p>
        </GlowCard>

        {/* Version adoption */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">App Version Adoption</h3>
          <div className="space-y-3">
            {versions.map((v, i) => {
              const pct = totalSessions > 0 ? Math.round((v.users / totalSessions) * 100) : 0;
              return (
                <div key={v.version}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">LATEST</span>}
                      <span className="text-sm font-mono text-gray-300">v{v.version}</span>
                    </div>
                    <span className="text-xs text-gray-500">{v.users} users ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${i === 0 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {versions.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-sm">
                No version data yet — will populate as users open the app
              </div>
            )}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
