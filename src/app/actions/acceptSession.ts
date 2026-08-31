'use server';

import { db } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function acceptMonitoringSession(secureToken: string) {
  // Find the pending session
  const session = await db.monitoringSession.findUnique({
    where: { secureToken },
    include: { employee: { include: { user: true } }, admin: true }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'PENDING') {
    throw new Error('This session has already been processed or expired.');
  }

  // Update session to ACTIVE
  const updatedSession = await db.monitoringSession.update({
    where: { id: session.id },
    data: {
      status: 'ACTIVE',
      startedAt: new Date(),
    },
  });

  await logAuditAction(session.employee.user.id, 'SESSION_ACCEPTED', session.id);

  return { success: true, sessionId: updatedSession.id };
}
