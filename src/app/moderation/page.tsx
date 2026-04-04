import { getReports, getAllUsers } from "@/lib/queries";
import { GlowCard } from "@/components/metric-card";
import { ModerationActions } from "@/components/moderation-actions";
import { UserSearch } from "@/components/user-search";

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
        <UserSearch allUsers={users as any[]} />
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
