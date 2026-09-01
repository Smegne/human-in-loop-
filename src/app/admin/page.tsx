import StatCard from '@/components/admin/StatCard';
import { Users, Video, Clock, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { Prisma } from '@/generated/prisma';

type SessionWithEmployee = Prisma.MonitoringSessionGetPayload<{
  include: { employee: { include: { user: true } } };
}>;

export default async function AdminDashboard() {
  let employeeCount = 0;
  let activeSessions = 0;
  let completedSessions = 0;
  let recentSessions: SessionWithEmployee[] = [];
  let dbError: string | null = null;


  try {
    [employeeCount, activeSessions, completedSessions, recentSessions] = await Promise.all([
      db.user.count({ where: { role: 'EMPLOYEE' } }),
      db.monitoringSession.count({ where: { status: { in: ['ACTIVE', 'PENDING'] } } }),
      db.monitoringSession.count({ where: { status: 'COMPLETED' } }),
      db.monitoringSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { employee: { include: { user: true } } },
      }),
    ]);
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
    console.error('Admin dashboard DB error:', dbError);
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back. Here is what&apos;s happening today.</p>
      </div>

      {dbError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <strong>Database error:</strong> {dbError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={employeeCount}
          description="Registered employees"
          icon={Users}
        />
        <StatCard
          title="Active Sessions"
          value={activeSessions}
          description="Currently sharing screen"
          icon={Video}
        />
        <StatCard
          title="Completed Sessions"
          value={completedSessions}
          description="Total historical sessions"
          icon={CheckCircle}
        />
        <StatCard
          title="Avg. Duration"
          value="45m"
          description="Per monitoring session"
          icon={Clock}
        />
      </div>

      <div className="rounded-xl border bg-white shadow-sm mt-8">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Recent Monitoring Sessions</h3>
        </div>
        <div className="p-6">
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent sessions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Duration</th>
                    <th className="pb-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium text-gray-900">
                        {session.employee.user.name}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            session.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : session.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right text-gray-500">
                        {session.durationMinutes}m
                      </td>
                      <td className="py-4 text-right">
                        {(session.status === 'PENDING' || session.status === 'ACTIVE') && (
                          <a
                            href={`/admin/sessions/${session.id}`}
                            className="text-sm font-medium text-devvoltz-secondary hover:text-blue-600 transition-colors"
                          >
                            View Live
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
