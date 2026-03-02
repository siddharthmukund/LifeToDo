import type { AIProvider } from '../aiProvider';
import type { AIRequest, AIResponse, AIStreamChunk, JSONSchema } from '../types';
import { AIError } from '../types';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  supportsStructuredOutput = true;
  supportsStreaming = true;
  maxContextTokens = 1_000_000;
  private model: string;
  private apiKey: string;
  private baseEndpoint: string;

  constructor(config: { model: string; apiKey?: string; apiEndpoint?: string }) {
    this.model = config.model ?? 'gemini-2.0-flash';
    this.apiKey = config.apiKey ?? (typeof process !== 'undefined' ? process.env.AI_API_KEY ?? '' : '');
    this.baseEndpoint =
      config.apiEndpoint ??
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}`;
  }

  mapSchema(schema: JSONSchema): unknown { return schema; }

  mapError(error: unknown): AIError {
    if (error instanceof AIError) return error;
    const e = error as { status?: number; message?: string };
    if (e.status === 429) return new AIError('RATE_LIMITED', 'Gemini rate limit exceeded', 60_000);
    if (e.status === 401 || e.status === 403) return new AIError('AUTH_ERROR', 'Gemini auth failed');
    if (e.status === 503) return new AIError('PROVIDER_ERROR', 'Gemini overloaded');
    return new AIError('PROVIDER_ERROR', e.message ?? 'Gemini error');
  }

  async call(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const generationConfig: Record<string, unknown> = {
      temperature: request.temperature ?? 0.3,
      maxOutputTokens: request.maxTokens ?? 1024,
    };
    if (request.schema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = this.mapSchema(request.schema);
    }
    const body = {
      system_instruction: { parts: [{ text: request.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: request.userMessage }] }],
      generationConfig,
    };
    const res = await fetch(`${this.baseEndpoint}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw this.mapError({ status: res.status });
    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      content,
      parsed: request.schema ? JSON.parse(content) : undefined,
      usage: { inputTokens: data.usageMetadata?.promptTokenCount ?? 0, outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0 },
      provider: 'gemini',
      model: this.model,
      latencyMs: Date.now() - start,
    };
  }

  async *callStreaming(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const body = {
      system_instruction: { parts: [{ text: request.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: request.userMessage }] }],
      generationConfig: { temperature: request.temperature ?? 0.7, maxOutputTokens: request.maxTokens ?? 1024 },
    };
    const res = await fetch(`${this.baseEndpoint}:streamGenerateContent?key=${this.apiKey}&alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw this.mapError({ status: res.status });
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
        try {
          const chunk = JSON.parse(line.slice(6)) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          const delta = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (delta) yield { delta, done: false };
        } catch { /* skip */ }
      }
    }
  }
}
