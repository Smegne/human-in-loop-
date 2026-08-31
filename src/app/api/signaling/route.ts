import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sender, type, payload } = body;

    if (!sessionId || !sender || !type || !payload) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const message = await db.signalingMessage.create({
      data: {
        sessionId,
        sender,
        type,
        payload: JSON.stringify(payload),
      },
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error: any) {
    console.error('Signaling POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const lastId = searchParams.get('lastId'); // Optional: fetch messages after this ID
    const senderFilter = searchParams.get('sender'); // Only fetch messages NOT from this sender

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    let whereClause: any = { sessionId };
    
    if (senderFilter) {
      whereClause.sender = { not: senderFilter };
    }

    if (lastId) {
      // Find the created time of the lastId
      const lastMsg = await db.signalingMessage.findUnique({ where: { id: lastId } });
      if (lastMsg) {
        whereClause.createdAt = { gt: lastMsg.createdAt };
      }
    }

    const messages = await db.signalingMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Signaling GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
