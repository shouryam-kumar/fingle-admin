"use client";

import { useState } from "react";
import { searchContentAction, getRecentContentAction, getPostByIdAction } from "@/lib/actions";
import { ContentDeleteButton } from "./content-delete-button";

export function ContentBrowser() {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const extractPostId = (input: string): string | null => {
    // Match fingle.app/p/{uuid} or just a raw UUID
    const urlMatch = input.match(/\/p\/([a-f0-9-]{36})/i);
    if (urlMatch) return urlMatch[1];
    const uuidMatch = input.match(/^[a-f0-9-]{36}$/i);
    if (uuidMatch) return uuidMatch[0];
    return null;
  };

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 3) {
      setContent([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      // Check if input is a post link or UUID
      const postId = extractPostId(q.trim());
      if (postId) {
        const results = await getPostByIdAction(postId);
        setContent(results as any[]);
      } else {
        const results = await searchContentAction(q);
        setContent(results as any[]);
      }
      setSearched(true);
    } catch (e) {
      console.error("Search failed:", e);
    }
    setLoading(false);
  };

  const loadRecent = async () => {
    setLoading(true);
    try {
      const results = await getRecentContentAction(30);
      setContent(results as any[]);
      setSearched(true);
      setQuery("");
    } catch (e) {
      console.error("Load failed:", e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by username, name, or paste a post link..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
        <button
          onClick={loadRecent}
          disabled={loading}
          className="px-4 py-2.5 bg-purple-700/50 text-purple-200 rounded-xl text-sm hover:bg-purple-600/50 disabled:opacity-50 whitespace-nowrap"
        >
          Load Recent
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm mb-3">Loading...</p>}

      {!searched && !loading && (
        <p className="text-gray-500 text-sm">Search by username or click &quot;Load Recent&quot; to browse posts</p>
      )}

      {searched && content.length === 0 && (
        <p className="text-gray-500 text-sm">No posts found</p>
      )}

      {content.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((post: any) => (
            <div key={post.id} className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/30 hover:border-gray-600/50 transition-colors">
              {post.thumbnail_url ? (
                <div className="relative">
                  <img src={post.thumbnail_url} alt="" className="w-full h-48 object-cover" />
                  <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-black/60 text-white uppercase">
                    {post.type}
                  </span>
                  {post.views > 0 && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-black/60 text-white">
                      {post.views} views
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-32 bg-gray-700/30 flex items-center justify-center">
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">{post.type}</span>
                </div>
              )}

              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {post.profile_pic ? (
                    <img src={post.profile_pic} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-xs text-purple-300">
                      {(post.user_name ?? '?')[0]}
                    </div>
                  )}
                  <span className="text-sm text-white">{post.user_name}</span>
                  <span className="text-xs text-gray-500">@{post.username}</span>
                </div>

                <p className="text-sm text-gray-400 line-clamp-2">{post.content_text || 'No caption'}</p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <a href={`/moderation/user/${post.user_id}`} className="text-xs text-purple-400 hover:text-purple-300">Profile</a>
                    <ContentDeleteButton postId={post.id} postType={post.type} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
