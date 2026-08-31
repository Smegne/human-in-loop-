import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If there's no session or the user is not an admin, redirect to login
  if (!session) {
    redirect('/login');
  }

  // Assuming you add role check to session later. For now, checking session is enough.

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
