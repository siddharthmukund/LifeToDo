import type { AIRequest, AIResponse, AIStreamChunk, JSONSchema } from './types';

export interface AIProvider {
  readonly name: string;
  call(request: AIRequest): Promise<AIResponse>;
  callStreaming(request: AIRequest): AsyncGenerator<AIStreamChunk>;
  supportsStructuredOutput: boolean;
  supportsStreaming: boolean;
  maxContextTokens: number;
  mapSchema(schema: JSONSchema): unknown;
  mapError(error: unknown): import('./types').AIError;
}
