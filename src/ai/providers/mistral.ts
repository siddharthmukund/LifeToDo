import type { AIProvider } from '../aiProvider';
import type { AIRequest, AIResponse, AIStreamChunk, JSONSchema } from '../types';
import { AIError } from '../types';

export class MistralProvider implements AIProvider {
  readonly name = 'mistral';
  supportsStructuredOutput = true;
  supportsStreaming = true;
  maxContextTokens = 32_000;
  private model: string;
  private apiKey: string;
  private endpoint: string;

  constructor(config: { model: string; apiKey?: string; apiEndpoint?: string }) {
    this.model = config.model ?? 'mistral-small-latest';
    this.apiKey = config.apiKey ?? (typeof process !== 'undefined' ? process.env.AI_API_KEY ?? '' : '');
    this.endpoint = config.apiEndpoint ?? 'https://api.mistral.ai/v1/chat/completions';
  }

  mapSchema(_schema: JSONSchema): unknown { return { type: 'json_object' }; }

  mapError(error: unknown): AIError {
    if (error instanceof AIError) return error;
    const e = error as { status?: number; message?: string };
    if (e.status === 429) return new AIError('RATE_LIMITED', 'Mistral rate limit exceeded', 60_000);
    if (e.status === 401) return new AIError('AUTH_ERROR', 'Mistral auth failed');
    return new AIError('PROVIDER_ERROR', e.message ?? 'Mistral error');
  }

  private buildBody(request: AIRequest, stream = false): object {
    const sys = request.schema ? `${request.systemPrompt}\n\nRespond ONLY with valid JSON.` : request.systemPrompt;
    return {
      model: this.model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: request.userMessage }],
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 1024,
      response_format: request.schema ? this.mapSchema(request.schema) : undefined,
      stream,
    };
  }

  async call(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(this.buildBody(request)),
    });
    if (!res.ok) throw this.mapError({ status: res.status });
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
    const content = data.choices?.[0]?.message?.content ?? '';
    return {
      content, parsed: request.schema ? JSON.parse(content) : undefined,
      usage: { inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 },
      provider: 'mistral', model: this.model, latencyMs: Date.now() - start,
    };
  }

  async *callStreaming(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(this.buildBody(request, true)),
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
        const json = line.slice(6);
        if (json === '[DONE]') { yield { delta: '', done: true }; return; }
        try {
          const chunk = JSON.parse(json) as { choices?: Array<{ delta?: { content?: string } }> };
          const delta = chunk.choices?.[0]?.delta?.content ?? '';
          if (delta) yield { delta, done: false };
        } catch { /* skip */ }
      }
    }
  }
}
