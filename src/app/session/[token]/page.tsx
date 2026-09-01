import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ConsentForm from '@/components/session/ConsentForm';
import { Activity } from 'lucide-react';

export default async function SessionConsentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let session;
  try {
    session = await db.monitoringSession.findUnique({
      where: { secureToken: token },
      include: {
        admin: true,
        employee: { include: { user: true } },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Session page DB error:', msg);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-sm">{msg}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return notFound();
  }

  // Check if session is still pending
  if (session.status !== 'PENDING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg border border-gray-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
            <Activity className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Unavailable</h2>
          <p className="text-gray-600">
            This monitoring session has already been processed, expired, or is currently active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-xl border border-gray-200 animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center border-b pb-6 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-devvoltz-secondary mb-4 shadow-md">
            <Activity className="h-8 w-8 text-devvoltz-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DevVoltz Monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">Secure Remote Session Request</p>
        </div>

        {/* Info */}
        <div className="space-y-4 mb-8">
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{session.admin.name}</span> has requested a remote monitoring session with you for <span className="font-semibold">{session.durationMinutes} minutes</span>.
            </p>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>During this session:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your screen will be visible to the administrator.</li>
              {session.isRecording && <li>Your screen activity will be recorded for compliance.</li>}
              <li>You can stop the session at any time from your browser controls.</li>
            </ul>
          </div>
        </div>

        {/* Client Form */}
        <ConsentForm sessionId={session.id} secureToken={token} employeeName={session.employee.user.name} />
      </div>
    </div>
  );
}
