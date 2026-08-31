import { db } from '@/lib/db';
import Link from 'next/link';
import { Video, PlayCircle } from 'lucide-react';
import ExternalSessionButton from '@/components/admin/ExternalSessionButton';

export default async function SessionsArchivePage() {
  const sessions = await db.monitoringSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      employee: { include: { user: true } },
      recording: true 
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Monitoring Sessions</h2>
          <p className="text-gray-500 mt-1">Browse all historical and active monitoring sessions.</p>
        </div>
        <ExternalSessionButton />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No sessions have been created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {session.employee.user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()}{' '}
                      {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                    <td className="px-6 py-4 text-gray-500">
                      {session.recording?.duration 
                        ? `${Math.floor(session.recording.duration / 60)}m ${session.recording.duration % 60}s` 
                        : `${session.durationMinutes}m (Requested)`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(session.status === 'PENDING' || session.status === 'ACTIVE') ? (
                        <Link
                          href={`/admin/sessions/${session.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Video className="h-4 w-4" />
                          View Live
                        </Link>
                      ) : session.status === 'COMPLETED' && session.recording ? (
                        <Link
                          href={`/admin/sessions/playback/${session.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-devvoltz-secondary hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <PlayCircle className="h-4 w-4" />
                          Play Recording
                        </Link>
                      ) : (
                        <span className="text-gray-400 italic text-sm">No recording</span>
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
  );
}
