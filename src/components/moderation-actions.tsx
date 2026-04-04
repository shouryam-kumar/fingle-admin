"use client";

import { useState } from "react";
import { suspendUser, resolveReport, deletePost } from "@/lib/queries";

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
