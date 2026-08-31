import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
    </div>
  );
}
