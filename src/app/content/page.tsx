import React from "react";
import { getContentStats, getCreatorRatio, getPostingHeatmap, getDeadContent } from "@/lib/queries";
import { ContentPieChart } from "@/components/charts";
import { MetricCard, GlowCard } from "@/components/metric-card";

export const revalidate = 300;

export default async function ContentPage() {
  const [contentStats, creatorRatio, heatmap, deadContent] = await Promise.all([
    getContentStats(),
    getCreatorRatio(),
    getPostingHeatmap(),
    getDeadContent(),
  ]);

  const pieData = [
    { name: "Photos", value: contentStats.photos },
    { name: "Videos", value: contentStats.videos },
    { name: "Scribbles", value: contentStats.scribbles },
    { name: "Beats", value: contentStats.beats },
  ].filter(d => d.value > 0);

  const maxHeat = Math.max(...heatmap.map(h => h.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Content Health</h2>
        <p className="text-gray-500 mt-1 text-sm">Content creation, distribution, and engagement health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Total Posts" value={contentStats.total} subtitle="All content" icon="📊" gradient="bg-purple-600" />
        <MetricCard title="Photos" value={contentStats.photos} subtitle="Photo posts" icon="📸" gradient="bg-violet-600" />
        <MetricCard title="Videos" value={contentStats.videos} subtitle="Bites" icon="🎬" gradient="bg-blue-600" />
        <MetricCard title="Scribbles" value={contentStats.scribbles} subtitle="Text posts" icon="✍️" gradient="bg-emerald-600" />
        <MetricCard title="Beats" value={contentStats.beats} subtitle="Audio posts" icon="🎵" gradient="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content distribution */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Content Distribution</h3>
          <ContentPieChart data={pieData} />
        </GlowCard>

        {/* Creator ratio */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Creator Economy</h3>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1f1f2e" strokeWidth="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#cg)" strokeWidth="2.5" strokeDasharray={`${creatorRatio.creatorPct}, 100`} strokeLinecap="round" />
                <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{creatorRatio.creatorPct}%</span>
                <span className="text-[10px] text-gray-500 font-medium">CREATORS</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
            <div className="text-center">
              <p className="text-xl font-bold text-purple-400">{creatorRatio.creators}</p>
              <p className="text-[10px] text-gray-500 mt-1">Creators</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-400">{creatorRatio.consumers}</p>
              <p className="text-[10px] text-gray-500 mt-1">Consumers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{creatorRatio.total}</p>
              <p className="text-[10px] text-gray-500 mt-1">Total</p>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Posting Heatmap */}
      <GlowCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Peak Posting Hours</h3>
          <span className="text-xs text-gray-600">UTC timezone</span>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 min-w-[700px]">
            {/* Header row */}
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center text-[9px] text-gray-600 pb-1">
                {h.toString().padStart(2, '0')}
              </div>
            ))}

            {/* Data rows */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <React.Fragment key={day}>
                <div className="text-xs text-gray-500 flex items-center">{day}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmap.find(h => h.day === day && h.hour === hour);
                  const count = cell?.count ?? 0;
                  const intensity = count / maxHeat;
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="aspect-square rounded-sm transition-colors"
                      style={{
                        backgroundColor: count > 0
                          ? `rgba(139, 92, 246, ${0.15 + intensity * 0.85})`
                          : 'rgba(255,255,255,0.02)',
                      }}
                      title={`${day} ${hour}:00 — ${count} posts`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Dead content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Dead Content</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{deadContent.dead}</p>
          <p className="text-xs text-gray-600 mt-1">Posts with zero reactions</p>
        </GlowCard>
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Dead Content Rate</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{deadContent.deadPct}%</p>
          <p className="text-xs text-gray-600 mt-1">of all posts</p>
        </GlowCard>
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Engaged Content</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{deadContent.total - deadContent.dead}</p>
          <p className="text-xs text-gray-600 mt-1">Posts with 1+ reactions</p>
        </GlowCard>
      </div>
    </div>
  );
}
