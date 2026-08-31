import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await auth();
    if (!sessionUser || sessionUser.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'recordings', `${sessionId}.webm`);
    
    // Check if file exists to get size
    let fileSize = 0;
    try {
      const stats = await fs.stat(filePath);
      fileSize = stats.size;
    } catch (err) {
      console.warn(`No recording file found for session ${sessionId}`);
    }

    // Update Session status to COMPLETED
    const session = await db.monitoringSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });

    // Create Recording record if file exists
    if (fileSize > 0) {
      // Calculate duration approx based on startedAt and now, or skip it
      let durationSeconds = 0;
      if (session.startedAt) {
        durationSeconds = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);
      }

      await db.recording.create({
        data: {
          sessionId,
          storageUrl: `/recordings/${sessionId}.webm`,
          fileSize,
          mimeType: 'video/webm',
          duration: durationSeconds,
        }
      });
    }

    // Also notify the employee to stop their screen share
    await db.signalingMessage.create({
      data: {
        sessionId,
        sender: 'ADMIN',
        type: 'stop-session',
        payload: '{}',
      }
    });

    // Log action
    await logAuditAction(sessionUser.user.id, 'SESSION_COMPLETED', sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Finalize recording error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
