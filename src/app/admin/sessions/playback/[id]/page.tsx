import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { ArrowLeft, Clock, FileVideo, Calendar } from 'lucide-react';

export default async function SessionPlaybackPage({ params }: { params: { id: string } }) {
  const sessionUser = await auth();
  if (!sessionUser || sessionUser.user?.role !== 'ADMIN') {
    return redirect('/login');
  }

  const session = await db.monitoringSession.findUnique({
    where: { id: params.id },
    include: {
      employee: { include: { user: true } },
      recording: true,
    }
  });

  if (!session || !session.recording) {
    return notFound();
  }

  const { recording } = session;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      <div className="flex items-center gap-4 border-b pb-4">
        <Link 
          href="/admin/sessions" 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Session Recording: {session.employee.user.name}
          </h2>
          <p className="text-gray-500 mt-1 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(session.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {recording.duration} seconds</span>
            <span className="flex items-center gap-1"><FileVideo className="h-4 w-4" /> {(recording.fileSize! / (1024 * 1024)).toFixed(2)} MB</span>
          </p>
        </div>
      </div>

      <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 aspect-video relative">
        <video 
          controls 
          className="w-full h-full object-contain"
          src={recording.storageUrl}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
        <h3 className="text-lg font-semibold border-b pb-4 mb-4">Session Notes & Report</h3>
        
        {/* Placeholder for future reporting Phase 8 functionality */}
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">
            Reporting features will be fully implemented in a future phase. For now, you can view the raw recording above.
          </p>
        </div>
      </div>

    </div>
  );
}
