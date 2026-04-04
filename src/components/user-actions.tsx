"use client";

import { useState } from "react";
import { suspendUser, unsuspendUser, deletePost } from "@/lib/queries";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  isSuspended?: boolean;
  postId?: string;
  postType?: string;
  isDeleteAction?: boolean;
}

export function UserActions({ userId, isSuspended, postId, postType, isDeleteAction }: UserActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Delete post action
  if (isDeleteAction && postId && postType) {
    const handleDelete = async () => {
      const reason = prompt('Reason for deleting this post:');
      if (!reason) return;
      if (!confirm('Are you sure you want to delete this post? The user will be notified.')) return;

      setLoading(true);
      try {
        await deletePost(postId, postType, reason, '');
        router.refresh();
      } catch (e) {
        alert('Failed to delete post');
      }
      setLoading(false);
    };

    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-2 py-1 rounded bg-red-700/50 text-red-300 hover:bg-red-600/50 disabled:opacity-50"
      >
        {loading ? '...' : 'Delete'}
      </button>
    );
  }

  // Suspend/unsuspend actions
  const handleSuspend = async (type: 'temporary' | 'permanent') => {
    const reason = prompt(`Reason for ${type} suspension:`);
    if (!reason) return;

    let expiresAt: string | undefined;
    if (type === 'temporary') {
      const days = prompt('Number of days to suspend (e.g., 7, 30):');
      if (!days) return;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(days));
      expiresAt = expiry.toISOString();
    }

    if (!confirm(`Are you sure you want to ${type}ly suspend this user? They will be notified.`)) return;

    setLoading(true);
    try {
      await suspendUser(userId, type, reason, '', expiresAt);
      router.refresh();
    } catch (e) {
      alert('Failed to suspend user');
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
      alert('Failed to unsuspend user');
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 mt-4">
      {isSuspended ? (
        <button
          onClick={handleUnsuspend}
          disabled={loading}
          className="text-xs px-4 py-2 rounded bg-green-700 text-green-200 hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Unsuspend User'}
        </button>
      ) : (
        <>
          <button
            onClick={() => handleSuspend('temporary')}
            disabled={loading}
            className="text-xs px-4 py-2 rounded bg-amber-700 text-amber-200 hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Temp Suspend'}
          </button>
          <button
            onClick={() => handleSuspend('permanent')}
            disabled={loading}
            className="text-xs px-4 py-2 rounded bg-red-700 text-red-200 hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Permanent Suspend'}
          </button>
        </>
      )}
    </div>
  );
}
