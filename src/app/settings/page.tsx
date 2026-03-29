"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { GlowCard } from "@/components/metric-card";

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export default function SettingsPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { email: user.email ?? "" } : null);

      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setAuditLog(data ?? []);
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const actionIcons: Record<string, string> = {
    login: "🔑",
    page_view: "👁️",
    export: "📤",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-500 mt-1 text-sm">Account and audit log</p>
        </div>
      </div>

      {/* Account */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Account</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.email ?? "Loading..."}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </GlowCard>

      {/* Admin emails */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Authorized Admins</h3>
        <div className="space-y-2">
          {(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "shouryam1508@gmail.com,shivam301097@gmail.com").split(",").map((email) => (
            <div key={email} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-gray-300">{email.trim()}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-700 mt-3">Managed via ADMIN_EMAILS environment variable</p>
      </GlowCard>

      {/* Audit Log */}
      <GlowCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Audit Log</h3>
          <span className="text-xs text-gray-600">{auditLog.length} entries</span>
        </div>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {auditLog.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
              <span className="text-base">{actionIcons[entry.action] ?? "📋"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">{entry.admin_email}</span>
                  {" "}
                  <span className="text-gray-500">{entry.action}</span>
                </p>
              </div>
              <span className="text-[10px] text-gray-600 shrink-0">
                {new Date(entry.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {auditLog.length === 0 && (
            <p className="text-xs text-gray-700 text-center py-8">No audit entries yet</p>
          )}
        </div>
      </GlowCard>
    </div>
  );
}
