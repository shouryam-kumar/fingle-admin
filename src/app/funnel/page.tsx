import { getFunnelData } from "@/lib/queries";
import { GlowCard } from "@/components/metric-card";

export const revalidate = 300;

export default async function FunnelPage() {
  const funnel = await getFunnelData();
  const maxCount = funnel[0]?.count ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Conversion Funnel</h2>
        <p className="text-gray-500 mt-1 text-sm">User journey from signup to engagement</p>
      </div>

      <GlowCard>
        <div className="space-y-6 py-4">
          {funnel.map((step, i) => {
            const pct = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
            const dropoff = i > 0 ? Math.round(((funnel[i - 1].count - step.count) / funnel[i - 1].count) * 100) : 0;
            const colors = ['from-purple-500 to-violet-500', 'from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];

            return (
              <div key={step.step}>
                {i > 0 && (
                  <div className="flex items-center gap-2 py-2 pl-4">
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-xs text-red-400 font-medium">
                      {dropoff}% drop-off ({funnel[i - 1].count - step.count} users lost)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-32 shrink-0">
                    <p className="text-sm font-medium text-gray-300">{step.step}</p>
                    <p className="text-2xl font-bold text-white">{step.count.toLocaleString()}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-12 bg-white/[0.03] rounded-xl overflow-hidden relative">
                      <div
                        className={`h-full rounded-xl bg-gradient-to-r ${colors[i]} transition-all duration-1000 flex items-center justify-end pr-3`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      >
                        <span className="text-xs font-bold text-white/90">{pct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* Conversion rates summary */}
      <div className="grid grid-cols-3 gap-4">
        {funnel.slice(1).map((step, i) => {
          const convRate = funnel[i].count > 0 ? Math.round((step.count / funnel[i].count) * 100) : 0;
          return (
            <GlowCard key={step.step} className="text-center">
              <p className="text-xs text-gray-500">{funnel[i].step} → {step.step}</p>
              <p className={`text-3xl font-bold mt-2 ${convRate >= 50 ? 'text-emerald-400' : convRate >= 20 ? 'text-amber-400' : 'text-red-400'}`}>
                {convRate}%
              </p>
              <p className="text-[10px] text-gray-600 mt-1">conversion rate</p>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}
