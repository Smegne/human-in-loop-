import { db } from '@/lib/db';
import { Shield, Clock, FileText } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

export default async function SettingsAuditPage() {
  const auditLogs = await db.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Settings & Audit Logs</h2>
          <p className="text-gray-500 mt-1">Review system compliance and recent administrative actions.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Security Policy"
          value="Strict"
          description="E2E encryption active"
          icon={Shield}
        />
        <StatCard
          title="Log Retention"
          value="90 Days"
          description="Standard compliance"
          icon={Clock}
        />
        <StatCard
          title="Total Events"
          value={auditLogs.length}
          description="In recent history"
          icon={FileText}
        />
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-lg text-gray-900">Security Audit Trail</h3>
        </div>
        <div className="p-0">
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No audit events have been logged yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">Actor ID</th>
                    <th className="px-6 py-3 font-medium">Target ID</th>
                    <th className="px-6 py-3 font-medium">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          log.action.includes('CREATED') ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          log.action.includes('COMPLETED') ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                          log.action.includes('ACCEPTED') ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          'bg-gray-50 text-gray-700 ring-gray-600/20'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[120px]" title={log.actorId || ''}>
                        {log.actorId || 'SYSTEM'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[120px]" title={log.targetId || ''}>
                        {log.targetId || '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {log.metadata ? (
                          <pre className="bg-gray-100 p-1.5 rounded overflow-x-auto max-w-[200px]">
                            {log.metadata}
                          </pre>
                        ) : '-'}
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
