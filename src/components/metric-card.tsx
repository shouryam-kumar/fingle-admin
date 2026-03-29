"use client";

import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  trend?: number; // percentage change
  icon?: string;
  gradient?: string;
}

export function MetricCard({ title, value, subtitle, trend, icon, gradient }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === "number" ? 0 : value);

  // Animated counter
  useEffect(() => {
    if (typeof value !== "number") {
      setDisplayValue(value);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12121a] p-5 transition-all duration-300 hover:border-white/[0.1] hover:shadow-xl hover:shadow-purple-500/5 group`}>
      {/* Gradient accent */}
      {gradient && (
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${gradient}`} />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          {icon && <span className="text-lg opacity-60">{icon}</span>}
        </div>

        <p className="text-3xl font-bold text-white mt-3 tracking-tight">
          {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
        </p>

        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
            }`}>
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
          )}
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-[#12121a] p-6 ${className}`}>
      {children}
    </div>
  );
}
