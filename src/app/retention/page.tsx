import { getRetentionCohorts } from "@/lib/queries";
import { GlowCard } from "@/components/metric-card";

export const dynamic = "force-dynamic"; // Always fresh data;

export default async function RetentionPage() {
  const cohorts = await getRetentionCohorts(6);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Retention</h2>
        <p className="text-gray-500 mt-1 text-sm">User retention by signup cohort — the most important metric for investors</p>
      </div>

      {/* Benchmarks */}
      <div className="grid grid-cols-3 gap-4">
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">D1 Target</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">&gt;40%</p>
          <p className="text-[10px] text-gray-600 mt-1">Industry benchmark</p>
        </GlowCard>
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">D7 Target</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">&gt;20%</p>
          <p className="text-[10px] text-gray-600 mt-1">Industry benchmark</p>
        </GlowCard>
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">D30 Target</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">&gt;10%</p>
          <p className="text-[10px] text-gray-600 mt-1">Industry benchmark</p>
        </GlowCard>
      </div>

      {/* Cohort Table */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-6">Weekly Cohort Retention</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Signup Week</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Signups</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Week 0</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Week 1</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Week 2</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Week 3</th>
                <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Week 4</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.week} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="text-sm font-medium text-gray-300 py-3 pr-4">
                    {new Date(cohort.week).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </td>
                  <td className="text-center text-sm text-gray-400 py-3 px-2">{cohort.signups}</td>
                  {cohort.retention.map((pct, i) => (
                    <td key={i} className="text-center py-3 px-2">
                      <span
                        className={`inline-block min-w-[40px] px-2 py-1 rounded-lg text-xs font-semibold ${
                          pct >= 50
                            ? "bg-emerald-500/20 text-emerald-300"
                            : pct >= 20
                            ? "bg-amber-500/20 text-amber-300"
                            : pct > 0
                            ? "bg-red-500/20 text-red-300"
                            : "text-gray-700"
                        }`}
                      >
                        {pct > 0 ? `${pct}%` : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
