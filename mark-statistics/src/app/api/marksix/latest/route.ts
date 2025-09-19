import { NextResponse } from 'next/server';
import { fetchLatest } from '@/lib/remote';

export async function GET() {
  try {
    const draw = await fetchLatest();
    return NextResponse.json({ ok: true, draw });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


