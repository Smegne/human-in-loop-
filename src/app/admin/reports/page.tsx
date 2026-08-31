import { db } from '@/lib/db';
import { FileText, Clock, Video } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

export default async function ReportsOverviewPage() {
  // Aggregate some simple metrics
  const totalSessions = await db.monitoringSession.count({ where: { status: 'COMPLETED' } });
  
  const recordings = await db.recording.findMany({
    select: { duration: true, fileSize: true }
  });

  const totalDurationSeconds = recordings.reduce((acc, rec) => acc + (rec.duration || 0), 0);
  const totalDurationHours = (totalDurationSeconds / 3600).toFixed(1);
  const totalStorageBytes = recordings.reduce((acc, rec) => acc + (rec.fileSize || 0), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">Overview of all monitoring activity.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Recorded Time"
          value={`${totalDurationHours} hrs`}
          description="Across all completed sessions"
          icon={Clock}
        />
        <StatCard
          title="Storage Used"
          value={`${totalStorageMB} MB`}
          description="Total size of video recordings"
          icon={Video}
        />
        <StatCard
          title="Written Reports"
          value={0}
          description="Reports attached to sessions"
          icon={FileText}
        />
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-12 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom reports yet</h3>
          <p className="text-sm">
            In future phases, you'll be able to attach detailed PDF/JSON reports to specific monitoring sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
