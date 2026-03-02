'use client';
import { AI_PROXY_URL, CLIENT_RATE_LIMIT } from './aiConfig';
import type { AIRequest, AIResponse, AIStreamChunk } from './types';
import { AIError } from './types';

const callLog: number[] = [];

function checkRateLimit(): void {
  const now = Date.now();
  const windowStart = now - 60_000;
  while (callLog.length > 0 && callLog[0] < windowStart) callLog.shift();
  if (callLog.length >= CLIENT_RATE_LIMIT.maxCallsPerMinute) {
    throw new AIError('RATE_LIMITED', 'Too many AI requests — try again in a moment', 10_000);
  }
  callLog.push(now);
}

export async function callAIProxy(request: AIRequest): Promise<AIResponse> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new AIError('OFFLINE', 'AI features require an internet connection');
  }
  checkRateLimit();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 429) throw new AIError('RATE_LIMITED', 'Rate limited', 60_000);
      if (res.status === 401) throw new AIError('AUTH_ERROR', 'AI auth failed');
      throw new AIError('PROVIDER_ERROR', (body as { error?: string })?.error ?? `HTTP ${res.status}`);
    }

    return res.json() as Promise<AIResponse>;
  } catch (e) {
    if (e instanceof AIError) throw e;
    if ((e as Error).name === 'AbortError') throw new AIError('TIMEOUT', 'AI request timed out');
    throw new AIError('NETWORK_ERROR', 'Network error calling AI service');
  } finally {
    clearTimeout(timeout);
  }
}

export async function* callAIProxyStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new AIError('OFFLINE', 'AI features require an internet connection');
  }
  checkRateLimit();

  const res = await fetch(`${AI_PROXY_URL}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!res.ok || !res.body) {
    throw new AIError('PROVIDER_ERROR', `Streaming failed: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) { yield { delta: '', done: true }; break; }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6);
      if (json === '[DONE]') { yield { delta: '', done: true }; return; }
      try { yield JSON.parse(json) as AIStreamChunk; } catch { /* skip */ }
    }
  }
}
