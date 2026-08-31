import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const chunk = formData.get('chunk') as Blob;

    if (!sessionId || !chunk) {
      return NextResponse.json({ error: 'Missing sessionId or chunk' }, { status: 400 });
    }

    const recordingsDir = path.join(process.cwd(), 'public', 'recordings');
    
    // Ensure the directory exists
    await fs.mkdir(recordingsDir, { recursive: true });

    const filePath = path.join(recordingsDir, `${sessionId}.webm`);
    
    // Convert Blob to Buffer
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Append to file (creates if it doesn't exist)
    await fs.appendFile(filePath, buffer);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Upload chunk error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
