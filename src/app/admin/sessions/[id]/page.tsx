import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import WebRTCAdmin from '@/components/admin/WebRTCAdmin';

export default async function AdminLiveSessionPage({ params }: { params: { id: string } }) {
  const sessionUser = await auth();
  if (!sessionUser || sessionUser.user?.role !== 'ADMIN') {
    return redirect('/login');
  }

  const session = await db.monitoringSession.findUnique({
    where: { id: params.id },
    include: {
      employee: { include: { user: true } }
    }
  });

  if (!session) return notFound();

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Session: {session.employee.user.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Session ID: {session.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
            session.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {session.status}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-lg relative border border-gray-800">
        <WebRTCAdmin sessionId={session.id} initialStatus={session.status} />
      </div>
    </div>
  );
}
