"use client";

import { useState, useCallback } from "react";
import { InlineSuspendButton } from "./moderation-actions";
import { searchUsersAction } from "@/lib/actions";

interface User {
  id: string;
  auth_id: string;
  name: string;
  username: string;
  email: string;
  profile_pic: string | null;
  is_verified: boolean;
  is_suspended: boolean;
  followers_count: number;
  created_at: string;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 3) {
      setUsers([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsersAction(q);
      setUsers(results as User[]);
      setSearched(true);
    } catch (e) {
      console.error("Search failed:", e);
    }
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, username, or email (min 3 chars)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
        />
      </div>

      {loading && <p className="text-gray-500 text-sm mb-3">Searching...</p>}

      {!searched && !loading && (
        <p className="text-gray-500 text-sm">Type 3+ characters to search users</p>
      )}

      {searched && users.length === 0 && (
        <p className="text-gray-500 text-sm">No users found for &quot;{query}&quot;</p>
      )}

      {users.length > 0 && (
        <>
          <div className="text-xs text-gray-500 mb-3">
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-700/50">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-center py-3 px-2">Followers</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Joined</th>
                  <th className="text-center py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {user.profile_pic ? (
                          <img src={user.profile_pic} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs text-purple-300">
                            {(user.name ?? '?')[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{user.email}</td>
                    <td className="py-3 px-2 text-center text-gray-300">{user.followers_count ?? 0}</td>
                    <td className="py-3 px-2 text-center">
                      {user.is_suspended ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Suspended</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a href={`/moderation/user/${user.auth_id ?? user.id}`} className="text-purple-400 hover:text-purple-300 text-xs">
                          Details
                        </a>
                        <InlineSuspendButton userId={user.auth_id ?? user.id} isSuspended={user.is_suspended} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
