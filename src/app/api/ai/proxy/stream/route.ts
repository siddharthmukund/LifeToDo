import { NextRequest } from 'next/server';
import type { AIRequest } from '@/ai/types';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AIRequest;
  const { streamAI } = await import('@/ai/aiService');
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamAI(body)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          if (chunk.done) break;
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`data: {"delta":"","done":true}\n\n`));
        console.error('Stream error:', e);
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
