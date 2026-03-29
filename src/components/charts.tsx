"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

interface TrendData {
  date: string;
  count: number;
}

interface EngagementData {
  date: string;
  reactions: number;
  views: number;
  messages: number;
}

const PURPLE = "#8b5cf6";
const VIOLET = "#7c3aed";
const INDIGO = "#6366f1";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";

const tooltipStyle = {
  backgroundColor: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e5e7eb",
};

export function SignupChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { day: "numeric", month: "short" })}
          tick={{ fontSize: 10, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#4b5563" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          labelFormatter={(d) => new Date(d as string).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
          contentStyle={tooltipStyle}
        />
        <Bar dataKey="count" fill={PURPLE} radius={[6, 6, 0, 0]} name="Signups" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DAUChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PURPLE} stopOpacity={0.4} />
            <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { day: "numeric", month: "short" })}
          tick={{ fontSize: 10, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#4b5563" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          labelFormatter={(d) => new Date(d as string).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
          contentStyle={tooltipStyle}
        />
        <Area type="monotone" dataKey="count" stroke={PURPLE} fill="url(#dauGradient)" strokeWidth={2.5} name="DAU" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function EngagementChart({ data }: { data: EngagementData[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barCategoryGap="15%">
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { day: "numeric", month: "short" })}
          tick={{ fontSize: 10, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#4b5563" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="reactions" fill={PURPLE} radius={[4, 4, 0, 0]} name="Reactions" />
        <Bar dataKey="views" fill={INDIGO} radius={[4, 4, 0, 0]} name="Views" />
        <Bar dataKey="messages" fill={EMERALD} radius={[4, 4, 0, 0]} name="Messages" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ContentPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const colors = [PURPLE, INDIGO, EMERALD, AMBER];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
