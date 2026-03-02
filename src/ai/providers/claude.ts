import type { AIProvider } from '../aiProvider';
import type { AIRequest, AIResponse, AIStreamChunk, JSONSchema } from '../types';
import { AIError } from '../types';

export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';
  supportsStructuredOutput = true;
  supportsStreaming = true;
  maxContextTokens = 200_000;
  private model: string;
  private apiKey: string;
  private endpoint: string;

  constructor(config: { model: string; apiKey?: string; apiEndpoint?: string }) {
    this.model = config.model ?? 'claude-3-5-haiku-20241022';
    this.apiKey = config.apiKey ?? (typeof process !== 'undefined' ? process.env.AI_API_KEY ?? '' : '');
    this.endpoint = config.apiEndpoint ?? 'https://api.anthropic.com/v1/messages';
  }

  mapSchema(schema: JSONSchema): unknown {
    return { name: 'structured_response', description: 'Return a structured JSON response', input_schema: schema };
  }

  mapError(error: unknown): AIError {
    if (error instanceof AIError) return error;
    const e = error as { status?: number; message?: string };
    if (e.status === 429) return new AIError('RATE_LIMITED', 'Claude rate limit exceeded', 60_000);
    if (e.status === 401) return new AIError('AUTH_ERROR', 'Claude auth failed');
    if (e.status === 529) return new AIError('PROVIDER_ERROR', 'Claude overloaded');
    return new AIError('PROVIDER_ERROR', e.message ?? 'Claude error');
  }

  async call(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: request.maxTokens ?? 1024,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userMessage }],
      temperature: request.temperature ?? 0.3,
    };
    if (request.schema) {
      body.tools = [this.mapSchema(request.schema)];
      body.tool_choice = { type: 'tool', name: 'structured_response' };
    }
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw this.mapError({ status: res.status });
    const data = await res.json() as { content?: Array<{ type: string; text?: string; input?: unknown }>; usage?: { input_tokens?: number; output_tokens?: number } };
    let content = '';
    let parsed: unknown;
    if (request.schema) {
      const toolBlock = data.content?.find((b) => b.type === 'tool_use');
      parsed = toolBlock?.input ?? {};
      content = JSON.stringify(parsed);
    } else {
      content = data.content?.find((b) => b.type === 'text')?.text ?? '';
    }
    return {
      content, parsed,
      usage: { inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 },
      provider: 'claude', model: this.model, latencyMs: Date.now() - start,
    };
  }

  async *callStreaming(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const body = {
      model: this.model, max_tokens: request.maxTokens ?? 1024,
      system: request.systemPrompt, messages: [{ role: 'user', content: request.userMessage }],
      temperature: request.temperature ?? 0.7, stream: true,
    };
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' },
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
          const chunk = JSON.parse(line.slice(6)) as { type: string; delta?: { text?: string } };
          if (chunk.type === 'content_block_delta') {
            const delta = chunk.delta?.text ?? '';
            if (delta) yield { delta, done: false };
          } else if (chunk.type === 'message_stop') { yield { delta: '', done: true }; return; }
        } catch { /* skip */ }
      }
    }
  }
}
