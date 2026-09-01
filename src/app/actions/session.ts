'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { randomBytes } from 'crypto';
import { logAuditAction } from '@/lib/audit';
import { headers } from 'next/headers';

/** Always returns the correct origin for the current environment. */
async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  // Derive from the incoming request host (works on Vercel, localhost, custom domains)
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const proto = host.startsWith('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

export async function createMonitoringSession(employeeId: string, durationMinutes: number = 60) {
  const session = await auth();
  if (!session || !session.user?.email) {
    throw new Error('Unauthorized');
  }

  // Find the admin user
  const admin = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Verify the employee exists
  const employeeProfile = await db.employeeProfile.findUnique({
    where: { userId: employeeId },
  });

  if (!employeeProfile) {
    throw new Error('Employee profile not found');
  }

  // Generate a cryptographically secure random token (48 characters hex)
  const secureToken = randomBytes(24).toString('hex');

  // Create the monitoring session in PENDING state
  const monitoringSession = await db.monitoringSession.create({
    data: {
      adminId: admin.id,
      employeeId: employeeProfile.id,
      secureToken,
      durationMinutes,
      isRecording: true,
      status: 'PENDING',
    },
  });

  // Log action
  await logAuditAction(admin.id, 'SESSION_CREATED', monitoringSession.id, {
    employeeId: employeeProfile.id,
    durationMinutes
  });

  // Construct the full URL
  const baseUrl = await getBaseUrl();
  const sessionUrl = `${baseUrl}/session/${secureToken}`;

  return {
    success: true,
    sessionId: monitoringSession.id,
    secureToken,
    sessionUrl,
  };
}

export async function createExternalSession() {
  const admin = await auth();
  if (!admin || admin.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Generate a random string for the guest name
  const randomSuffix = randomBytes(2).toString('hex');
  const guestName = `Guest_${randomSuffix}`;
  const guestEmail = `guest_${randomBytes(4).toString('hex')}@guest.local`;
  
  // Create a dummy User
  const guestUser = await db.user.create({
    data: {
      email: guestEmail,
      password: 'external_guest', // irrelevant since they don't log in
      role: 'EMPLOYEE',
      name: guestName,
    }
  });

  // Create EmployeeProfile
  const guestProfile = await db.employeeProfile.create({
    data: {
      userId: guestUser.id,
      status: 'ACTIVE', // Or whatever default
    }
  });

  // Now create the session using the same logic
  const secureToken = randomBytes(32).toString('hex');
  
  const monitoringSession = await db.monitoringSession.create({
    data: {
      adminId: admin.user.id,
      employeeId: guestProfile.id,
      secureToken,
      durationMinutes: 60,
      isRecording: true,
      status: 'PENDING',
    },
  });

  // Log action
  await logAuditAction(admin.user.id, 'EXTERNAL_SESSION_CREATED', monitoringSession.id, {
    employeeId: guestProfile.id,
    guestName,
  });

  // Construct the full URL
  const baseUrl = await getBaseUrl();
  const sessionUrl = `${baseUrl}/session/${secureToken}`;

  return { success: true, url: sessionUrl };
}
