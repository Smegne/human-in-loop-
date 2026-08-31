import { db } from './db';

export async function logAuditAction(
  actorId: string | null,
  action: string,
  targetId: string | null = null,
  metadata: any = null
) {
  try {
    await db.auditLog.create({
      data: {
        actorId,
        action,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // We intentionally don't throw here to avoid breaking the main workflow
    // if logging fails temporarily.
  }
}
