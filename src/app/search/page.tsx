"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { GlowCard } from "@/components/metric-card";
import { Input } from "@/components/ui/input";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserResult {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_pic: string;
  is_verified: boolean;
  created_at: string;
  onboarding_completed: boolean;
  age: number;
}

interface UserActivity {
  sessions: Array<{ started_at: string; duration_seconds: number; app_version: string }>;
  totalPosts: number;
  totalReactions: number;
  totalFollowing: number;
  lastActive: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }

    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("id, name, username, email, profile_pic, is_verified, created_at, onboarding_completed, age")
      .or(`name.ilike.%${q}%,username.ilike.%${q}%,email.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);
    setResults(data ?? []);
    setLoading(false);
  };

  const handleSelectUser = async (user: UserResult) => {
    setSelectedUser(user);

    const [sessions, posts, reactions, follows] = await Promise.all([
      supabase.from("user_sessions").select("started_at, duration_seconds, app_version").eq("user_id", user.id).order("started_at", { ascending: false }).limit(10),
      supabase.from("photo_posts").select("id").eq("user_id", user.id),
      supabase.from("video_reactions").select("id").eq("user_id", user.id),
      supabase.from("user_follows").select("id").eq("follower_id", user.id),
    ]);

    setActivity({
      sessions: sessions.data ?? [],
      totalPosts: posts.data?.length ?? 0,
      totalReactions: reactions.data?.length ?? 0,
      totalFollowing: follows.data?.length ?? 0,
      lastActive: sessions.data?.[0]?.started_at ?? null,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">User Search</h2>
        <p className="text-gray-500 mt-1 text-sm">Look up any user by name, username, or email</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Input
          placeholder="Search users by name, username, or email..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-[#12121a] border-white/[0.08] text-white placeholder:text-gray-600 h-12 rounded-xl text-sm pl-10"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            {loading ? "Searching..." : results.length > 0 ? `${results.length} results` : query.length >= 2 ? "No results" : "Type to search"}
          </h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                  selectedUser?.id === user.id ? "bg-purple-500/10 border border-purple-500/20" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
                  {user.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    {user.is_verified && <span className="text-blue-400 text-xs">✓</span>}
                  </div>
                  <p className="text-[11px] text-gray-500">@{user.username}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-600">
                    {new Date(user.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${user.onboarding_completed ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                    {user.onboarding_completed ? "Active" : "Incomplete"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </GlowCard>

        {/* User detail */}
        <GlowCard>
          {selectedUser ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-violet-500/30 flex items-center justify-center text-2xl font-bold text-purple-200">
                  {selectedUser.name?.[0] ?? "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                    {selectedUser.is_verified && <span className="text-blue-400">✓</span>}
                  </div>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                  <p className="text-xs text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              {/* User stats */}
              {activity && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Posts</p>
                      <p className="text-xl font-bold text-white">{activity.totalPosts}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Reactions Given</p>
                      <p className="text-xl font-bold text-white">{activity.totalReactions}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Following</p>
                      <p className="text-xl font-bold text-white">{activity.totalFollowing}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p className="text-sm font-medium text-white">
                        {activity.lastActive ? new Date(activity.lastActive).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                      </p>
                    </div>
                  </div>

                  {/* Recent sessions */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Sessions</p>
                    <div className="space-y-1">
                      {activity.sessions.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] text-xs">
                          <span className="text-gray-400">
                            {new Date(s.started_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-gray-500">
                            {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : "—"}
                          </span>
                          <span className="font-mono text-gray-600 text-[10px]">v{s.app_version}</span>
                        </div>
                      ))}
                      {activity.sessions.length === 0 && <p className="text-xs text-gray-700 py-2">No sessions recorded</p>}
                    </div>
                  </div>

                  {/* User info */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">User ID</span><span className="font-mono text-gray-400">{selectedUser.id.substring(0, 8)}...</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="text-gray-400">{selectedUser.age}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-gray-400">{new Date(selectedUser.created_at).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Onboarded</span><span className={selectedUser.onboarding_completed ? "text-emerald-400" : "text-amber-400"}>{selectedUser.onboarding_completed ? "Yes" : "No"}</span></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-700 text-sm">
              Select a user to view their activity
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
