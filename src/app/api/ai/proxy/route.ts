import { NextRequest, NextResponse } from 'next/server';
import type { AIRequest } from '@/ai/types';

const rateLimits = new Map<string, { count: number; windowStart: number }>();
const MAX_PER_MIN = 30;

function checkServerRateLimit(uid: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const entry = rateLimits.get(uid) ?? { count: 0, windowStart: now };
  if (entry.windowStart < windowStart) { rateLimits.set(uid, { count: 1, windowStart: now }); return true; }
  if (entry.count >= MAX_PER_MIN) return false;
  entry.count++;
  rateLimits.set(uid, entry);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIRequest;
    const uid = req.headers.get('x-uid') ?? 'anonymous';
    if (!checkServerRateLimit(uid)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }
    const { callAI } = await import('@/ai/aiService');
    const response = await callAI(body);
    return NextResponse.json(response);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    const status = err.code === 'RATE_LIMITED' ? 429 : err.code === 'AUTH_ERROR' ? 401 : 500;
    return NextResponse.json({ error: err.message ?? 'AI error' }, { status });
  }
}
