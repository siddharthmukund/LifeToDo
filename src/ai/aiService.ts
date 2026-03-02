// Server-side AI orchestrator — used by API route, not client directly
import type { AIRequest, AIResponse, AIStreamChunk } from './types';
import { AIError } from './types';
import { AI_CONFIG, FEATURE_TEMPERATURES } from './aiConfig';
import { resolveProvider } from './providers';

export async function callAI(request: AIRequest): Promise<AIResponse> {
  const provider = resolveProvider(AI_CONFIG);
  const temperature = request.temperature ?? FEATURE_TEMPERATURES[request.feature] ?? 0.3;
  let lastError: AIError | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await provider.call({ ...request, temperature });
    } catch (e) {
      const aiErr = e instanceof AIError ? e : new AIError('PROVIDER_ERROR', String(e));
      lastError = aiErr;
      if (['AUTH_ERROR', 'PARSE_ERROR', 'UNSUPPORTED_PROVIDER', 'OFFLINE'].includes(aiErr.code)) throw aiErr;
      if (attempt < 2) await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  throw lastError ?? new AIError('PROVIDER_ERROR', 'AI service unavailable');
}

export async function* streamAI(request: AIRequest): AsyncGenerator<AIStreamChunk> {
  const provider = resolveProvider(AI_CONFIG);
  if (!provider.supportsStreaming) {
    const response = await callAI(request);
    yield { delta: response.content, done: false };
    yield { delta: '', done: true };
    return;
  }
  yield* provider.callStreaming({ ...request, temperature: request.temperature ?? 0.7 });
}
