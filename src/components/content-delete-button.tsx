"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction } from "@/lib/actions";

export function ContentDeleteButton({ postId, postType }: { postId: string; postType: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const reason = prompt('Reason for deleting this post:');
    if (!reason) return;
    if (!confirm('Delete this post? The user will be notified.')) return;

    setLoading(true);
    try {
      await deletePostAction(postId, postType, reason);
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
