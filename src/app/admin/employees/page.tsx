import { db } from '@/lib/db';
import { Users, Plus, Mail } from 'lucide-react';
import Link from 'next/link';
import CreateSessionModal from '@/components/admin/CreateSessionModal';

export default async function EmployeesPage() {
  const employees = await db.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { employeeProfile: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-gray-500">Manage your team and their monitoring sessions.</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-devvoltz-primary px-4 py-2 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow-400">
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No employees</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by adding a new employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        {employee.employeeProfile?.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <CreateSessionModal employeeId={employee.id} employeeName={employee.name} />
                      <Link 
                        href={`/admin/employees/${employee.id}`}
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 p-1.5"
                      >
                        Details
                      </Link>
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
