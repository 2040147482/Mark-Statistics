import { NextRequest, NextResponse } from 'next/server';
import { fetchHistoryByYear } from '@/lib/remote';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  if (!year) {
    return NextResponse.json({ error: 'Missing year' }, { status: 400 });
  }
  try {
    const draws = await fetchHistoryByYear(year);
    return NextResponse.json({ ok: true, draws });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


