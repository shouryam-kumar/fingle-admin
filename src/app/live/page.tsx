"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { GlowCard } from "@/components/metric-card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ActivityEvent {
  id: string;
  type: "signup" | "post" | "reaction" | "message" | "session";
  description: string;
  timestamp: Date;
  icon: string;
}

export default function LivePage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);

  // Poll counters every 30s
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const [users, sessions] = await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("user_sessions").select("id", { count: "exact", head: true }).gte("started_at", `${today}T00:00:00`),
        ]);

        setTotalUsers(users.count ?? 0);
        setTodaySessions(sessions.count ?? 0);
      } catch {}
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const addEvent = (event: ActivityEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 50));
    };

    // Listen to new user signups
    const usersChannel = supabase
      .channel("admin-users")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users" }, (payload) => {
        addEvent({
          id: crypto.randomUUID(),
          type: "signup",
          description: `${payload.new.name ?? "New user"} signed up`,
          timestamp: new Date(),
          icon: "👤",
        });
        setTotalUsers((c) => c + 1);
      })
      .subscribe();

    // Listen to new posts
    const photosChannel = supabase
      .channel("admin-photos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "photo_posts" }, () => {
        addEvent({
          id: crypto.randomUUID(),
          type: "post",
          description: "New photo posted",
          timestamp: new Date(),
          icon: "📸",
        });
      })
      .subscribe();

    // Listen to new sessions
    const sessionsChannel = supabase
      .channel("admin-sessions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_sessions" }, () => {
        addEvent({
          id: crypto.randomUUID(),
          type: "session",
          description: "User opened the app",
          timestamp: new Date(),
          icon: "📱",
        });
        setTodaySessions((c) => c + 1);
        setOnlineCount((c) => c + 1);
      })
      .subscribe();

    // Listen to reactions
    const reactionsChannel = supabase
      .channel("admin-reactions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "video_reactions" }, () => {
        addEvent({
          id: crypto.randomUUID(),
          type: "reaction",
          description: "Content received a reaction",
          timestamp: new Date(),
          icon: "❤️",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(photosChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Feed</h2>
          <p className="text-gray-500 mt-1 text-sm">Real-time activity stream</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-400">LIVE</span>
        </div>
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Users</p>
          <p className="text-4xl font-bold text-white mt-2">{totalUsers.toLocaleString()}</p>
        </GlowCard>
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Sessions Today</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">{todaySessions}</p>
        </GlowCard>
        <GlowCard className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Events This Session</p>
          <p className="text-4xl font-bold text-emerald-400 mt-2">{events.length}</p>
        </GlowCard>
      </div>

      {/* Activity stream */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Activity Stream</h3>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm">Waiting for activity...</p>
            <p className="text-gray-700 text-xs mt-1">Events will appear here in real-time as users interact with the app</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <span className="text-lg">{event.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{event.description}</p>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
