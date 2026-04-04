"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suspendUser, unsuspendUser, resolveReport, deletePost } from "@/lib/queries";

export function ModerationActions({ reportId, reportType, reportedUserId }: { reportId: string; reportType: string; reportedUserId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleResolve = async (resolution: string) => {
    setLoading(true);
    try {
      await resolveReport(reportId, reportType, resolution, '', '');
      setDone(true);
    } catch (e) {
      alert('Failed to resolve report');
    }
    setLoading(false);
  };

  const handleSuspend = async () => {
    const reason = prompt('Suspension reason:');
    if (!reason) return;
    const type = confirm('Permanent suspension? (Cancel for temporary)') ? 'permanent' : 'temporary';

    setLoading(true);
    try {
      await suspendUser(reportedUserId, type, reason, '');
      await resolveReport(reportId, reportType, 'resolved', `User suspended: ${type}`, '');
      setDone(true);
    } catch (e) {
      alert('Failed to suspend user');
    }
    setLoading(false);
  };

  if (done) {
    return <p className="text-xs text-green-400 mt-2">Action completed</p>;
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleResolve('dismissed')}
        disabled={loading}
        className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
      >
        Dismiss
      </button>
      <button
        onClick={() => handleResolve('resolved')}
        disabled={loading}
        className="text-xs px-3 py-1 rounded bg-green-700 text-green-200 hover:bg-green-600 disabled:opacity-50"
      >
        Resolve
      </button>
      <button
        onClick={handleSuspend}
        disabled={loading}
        className="text-xs px-3 py-1 rounded bg-red-700 text-red-200 hover:bg-red-600 disabled:opacity-50"
      >
        Suspend User
      </button>
    </div>
  );
}

export function InlineSuspendButton({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSuspend = async () => {
    const reason = prompt('Suspension reason:');
    if (!reason) return;
    const type = confirm('Permanent suspension? (Cancel for temporary)') ? 'permanent' : 'temporary';

    let expiresAt: string | undefined;
    if (type === 'temporary') {
      const days = prompt('Days to suspend (e.g., 7, 30):');
      if (!days) return;
      const d = new Date();
      d.setDate(d.getDate() + parseInt(days));
      expiresAt = d.toISOString();
    }

    if (!confirm(`${type === 'permanent' ? 'PERMANENTLY' : 'Temporarily'} suspend this user?`)) return;

    setLoading(true);
    try {
      await suspendUser(userId, type, reason, '', expiresAt);
      router.refresh();
    } catch (e) {
      alert('Failed to suspend');
    }
    setLoading(false);
  };

  const handleUnsuspend = async () => {
    if (!confirm('Unsuspend this user?')) return;
    setLoading(true);
    try {
      await unsuspendUser(userId, '');
      router.refresh();
    } catch (e) {
      alert('Failed to unsuspend');
    }
    setLoading(false);
  };

  if (isSuspended) {
    return (
      <button onClick={handleUnsuspend} disabled={loading}
        className="text-xs px-2 py-1 rounded bg-green-700/50 text-green-300 hover:bg-green-600/50 disabled:opacity-50">
        {loading ? '...' : 'Unsuspend'}
      </button>
    );
  }

  return (
    <button onClick={handleSuspend} disabled={loading}
      className="text-xs px-2 py-1 rounded bg-red-700/50 text-red-300 hover:bg-red-600/50 disabled:opacity-50">
      {loading ? '...' : 'Suspend'}
    </button>
  );
}
