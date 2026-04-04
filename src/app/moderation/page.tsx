import { getReports, getAllUsers } from "@/lib/queries";
import { GlowCard } from "@/components/metric-card";
import { ModerationActions, InlineSuspendButton } from "@/components/moderation-actions";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const [reports, users] = await Promise.all([
    getReports(undefined, 50, 0),
    getAllUsers(50, 0),
  ]);

  const pendingReports = (reports as any[]).filter((r: any) => r.status === 'pending');
  const resolvedReports = (reports as any[]).filter((r: any) => r.status !== 'pending');
  const suspendedUsers = (users as any[]).filter((u: any) => u.is_suspended);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Moderation</h2>
        <p className="text-gray-500 mt-1 text-sm">Reports, suspensions, and content moderation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlowCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Pending Reports</p>
          <p className="text-3xl font-bold text-white mt-1">{pendingReports.length}</p>
        </GlowCard>
        <GlowCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Reports</p>
          <p className="text-3xl font-bold text-white mt-1">{(reports as any[]).length}</p>
        </GlowCard>
        <GlowCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Suspended Users</p>
          <p className="text-3xl font-bold text-white mt-1">{suspendedUsers.length}</p>
        </GlowCard>
        <GlowCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-bold text-white mt-1">{(users as any[]).length}</p>
        </GlowCard>
      </div>

      {/* Pending Reports */}
      <GlowCard>
        <h3 className="text-lg font-semibold text-white mb-4">Pending Reports ({pendingReports.length})</h3>
        {pendingReports.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending reports</p>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report: any) => (
              <div key={report.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">
                      {report.report_type}
                    </span>
                    <span className="text-sm text-white ml-2 font-medium">
                      {report.reporter_name ?? report.reporter_username} reported {report.reported_name ?? report.reported_username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Reason: {report.reason}</p>
                {report.additional_info && (
                  <p className="text-xs text-gray-500 mt-1">{report.additional_info}</p>
                )}
                <ModerationActions reportId={report.id} reportType={report.report_type} reportedUserId={report.reported_user_id} />
              </div>
            ))}
          </div>
        )}
      </GlowCard>

      {/* User Management */}
      <GlowCard>
        <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
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
              {(users as any[]).map((user: any) => (
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
      </GlowCard>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <GlowCard>
          <h3 className="text-lg font-semibold text-white mb-4">Resolved Reports ({resolvedReports.length})</h3>
          <div className="space-y-2">
            {resolvedReports.map((report: any) => (
              <div key={report.id} className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">{report.report_type}</span>
                  <span className="text-sm text-gray-300 ml-2">
                    {report.reported_name ?? report.reported_username}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">— {report.reason}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  report.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
