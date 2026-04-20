"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { GlowCard, MetricCard } from "@/components/metric-card";

interface KYCRequest {
  id: string;
  user_id: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  selfie_url: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  users: { name: string; username: string; email: string; age: number; profile_pic: string } | null;
}

/** Format the time between two instants as a short human string, e.g. "2m", "3h", "1d 4h". */
function formatDelta(start: Date, end: Date): string {
  const totalMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  if (totalMinutes < 1) return "<1m";
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) return mins ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours ? `${days}d ${remHours}h` : `${days}d`;
}

export default function KYCPage() {
  const [queue, setQueue] = useState<KYCRequest[]>([]);
  const [history, setHistory] = useState<KYCRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [selected, setSelected] = useState<KYCRequest | null>(null);
  const [aadhaarUrl, setAadhaarUrl] = useState("");
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [queueRes, statsRes, historyRes] = await Promise.all([
      supabase.from("kyc_verifications").select("*, users!kyc_verifications_user_id_fkey(name, username, email, age, profile_pic)").eq("status", "pending").order("created_at", { ascending: true }),
      Promise.all([
        supabase.from("kyc_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("kyc_verifications").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("kyc_verifications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      ]),
      supabase.from("kyc_verifications").select("*, users!kyc_verifications_user_id_fkey(name, username, profile_pic)").neq("status", "pending").order("reviewed_at", { ascending: false, nullsFirst: false }).limit(20),
    ]);

    setQueue(queueRes.data ?? []);
    setStats({ pending: statsRes[0].count ?? 0, approved: statsRes[1].count ?? 0, rejected: statsRes[2].count ?? 0 });
    setHistory(historyRes.data ?? []);
  };

  const selectRequest = async (req: KYCRequest) => {
    setSelected(req);
    setAadhaarUrl("");
    setAadhaarBackUrl("");
    setSelfieUrl("");
    const [aadhaarFront, aadhaarBack, selfie] = await Promise.all([
      supabase.storage.from("kyc-documents").createSignedUrl(req.aadhaar_front_url, 3600),
      req.aadhaar_back_url
        ? supabase.storage.from("kyc-documents").createSignedUrl(req.aadhaar_back_url, 3600)
        : Promise.resolve({ data: null }),
      supabase.storage.from("kyc-documents").createSignedUrl(req.selfie_url, 3600),
    ]);
    setAadhaarUrl(aadhaarFront.data?.signedUrl ?? "");
    setAadhaarBackUrl(aadhaarBack.data?.signedUrl ?? "");
    setSelfieUrl(selfie.data?.signedUrl ?? "");
  };

  const handleApprove = async () => {
    if (!selected) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("kyc_verifications").update({
      status: "approved",
      reviewed_by: user?.email,
      reviewed_at: new Date().toISOString(),
    }).eq("id", selected.id);

    // `is_verified` drives the verified badge in the mobile app; `kyc_verified`
    // is the KYC-specific flag. Keep both in sync on approve so the tick shows up.
    await supabase.from("users").update({
      kyc_verified: true,
      kyc_verified_at: new Date().toISOString(),
      kyc_method: "manual",
      is_verified: true,
    }).eq("id", selected.user_id);

    setSelected(null);
    setLoading(false);
    loadData();
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("kyc_verifications").update({
      status: "rejected",
      reviewed_by: user?.email,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectReason.trim(),
    }).eq("id", selected.id);

    // Defensive: if a previous approval set kyc_verified / is_verified on this
    // user, drop them now that we're rejecting.
    await supabase.from("users").update({
      kyc_verified: false,
      is_verified: false,
    }).eq("id", selected.user_id);

    setSelected(null);
    setRejectReason("");
    setLoading(false);
    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">KYC Verification</h2>
        <p className="text-gray-500 mt-1 text-sm">Review identity verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Pending" value={stats.pending} subtitle="Awaiting review" icon="⏳" gradient="bg-amber-600" />
        <MetricCard title="Approved" value={stats.approved} subtitle="Verified users" icon="✅" gradient="bg-emerald-600" />
        <MetricCard title="Rejected" value={stats.rejected} subtitle="Failed verification" icon="❌" gradient="bg-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue */}
        <GlowCard>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            Pending Queue ({queue.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queue.map((req) => (
              <button
                key={req.id}
                onClick={() => selectRequest(req)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                  selected?.id === req.id ? "bg-purple-500/10 border border-purple-500/20" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-300">
                  {req.users?.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{req.users?.name ?? "Unknown"}</p>
                  <p className="text-[10px] text-gray-500">@{req.users?.username ?? "unknown"}</p>
                </div>
                <span className="text-[10px] text-gray-600">
                  {new Date(req.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </span>
              </button>
            ))}
            {queue.length === 0 && (
              <div className="text-center py-12 text-gray-700 text-sm">No pending requests</div>
            )}
          </div>
        </GlowCard>

        {/* Review panel */}
        <GlowCard>
          {selected ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">
                Review: {selected.users?.name ?? "Unknown User"}
              </h3>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Username: @{selected.users?.username}</p>
                <p>Email: {selected.users?.email}</p>
                <p>Age: {selected.users?.age}</p>
              </div>

              {/* Document comparison — click a thumbnail to open full-size in a new tab */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Aadhaar Front", url: aadhaarUrl, hasSrc: true, alt: "Aadhaar front" },
                  {
                    label: "Aadhaar Back",
                    url: aadhaarBackUrl,
                    hasSrc: Boolean(selected.aadhaar_back_url),
                    alt: "Aadhaar back",
                  },
                  { label: "Selfie", url: selfieUrl, hasSrc: true, alt: "Selfie" },
                ].map((doc) => (
                  <div key={doc.label}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{doc.label}</p>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06] relative group">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full"
                          title="Open full size"
                        >
                          <img src={doc.url} alt={doc.alt} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all text-[11px] font-medium text-white pointer-events-none">
                            Click to open full size ↗
                          </div>
                        </a>
                      ) : doc.hasSrc ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">Loading...</div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">Not provided</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Approve"}
                </button>

                <div>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (required)..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-600 text-sm mb-2"
                  />
                  <button
                    onClick={handleReject}
                    disabled={loading || !rejectReason.trim()}
                    className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-semibold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-700 text-sm">
              Select a request to review
            </div>
          )}
        </GlowCard>
      </div>

      {/* History */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Review History</h3>
        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {history.map((req) => {
            const approved = req.status === "approved";
            const reviewedAt = req.reviewed_at ? new Date(req.reviewed_at) : null;
            const submittedAt = new Date(req.created_at);
            return (
              <div key={req.id} className="px-3 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  {req.users?.profile_pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={req.users.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${approved ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                      {req.users?.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {req.users?.name ?? "Unknown"}
                      {req.users?.username && (
                        <span className="text-gray-500 font-normal"> · @{req.users.username}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {req.reviewed_by ? `Reviewed by ${req.reviewed_by}` : "Reviewed"}
                      {reviewedAt && (
                        <> · in {formatDelta(submittedAt, reviewedAt)}</>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${approved ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {reviewedAt
                        ? reviewedAt.toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                        : "—"}
                    </span>
                  </div>
                </div>
                {!approved && req.rejection_reason && (
                  <p className="mt-2 text-[11px] text-red-300/80 pl-11">
                    Reason: {req.rejection_reason}
                  </p>
                )}
              </div>
            );
          })}
          {history.length === 0 && <p className="text-xs text-gray-700 text-center py-4">No reviews yet</p>}
        </div>
      </GlowCard>
    </div>
  );
}
