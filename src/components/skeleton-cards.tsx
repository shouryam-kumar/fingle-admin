"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121a] p-5">
      <Skeleton className="h-3 w-20 bg-white/[0.06]" />
      <Skeleton className="h-8 w-24 mt-3 bg-white/[0.06]" />
      <Skeleton className="h-3 w-32 mt-2 bg-white/[0.06]" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121a] p-6">
      <Skeleton className="h-4 w-40 mb-6 bg-white/[0.06]" />
      <div className="flex items-end gap-2 h-[250px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 bg-white/[0.04] rounded-t"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121a] p-6">
      <Skeleton className="h-4 w-40 mb-6 bg-white/[0.06]" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-white/[0.03]">
          <Skeleton className="h-4 w-20 bg-white/[0.06]" />
          <Skeleton className="h-4 flex-1 bg-white/[0.04]" />
          <Skeleton className="h-4 w-12 bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}
