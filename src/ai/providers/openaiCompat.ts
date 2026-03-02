import { OpenAIProvider } from './openai';
import type { AIRequest, AIResponse, JSONSchema } from '../types';
import { AIError } from '../types';

export class OpenAICompatProvider extends OpenAIProvider {
  override readonly name = 'openai-compat';
  override supportsStructuredOutput = false;

  constructor(config: { model: string; apiKey?: string; apiEndpoint?: string }) {
    if (!config.apiEndpoint) throw new AIError('UNSUPPORTED_PROVIDER', 'openai-compat requires NEXT_PUBLIC_AI_ENDPOINT');
    super(config);
  }

  override mapSchema(_schema: JSONSchema): unknown { return undefined; }

  override async call(request: AIRequest): Promise<AIResponse> {
    const augmented: AIRequest = request.schema
      ? { ...request, systemPrompt: `${request.systemPrompt}\n\nRespond with valid JSON only.`, schema: undefined }
      : request;
    const response = await super.call(augmented);
    if (request.schema && response.content) {
      try {
        const m = response.content.match(/```json\n?([\s\S]*?)\n?```/) ?? response.content.match(/\{[\s\S]*\}/) ?? response.content.match(/\[[\s\S]*\]/);
        const s = m?.[1] ?? m?.[0] ?? response.content;
        return { ...response, parsed: JSON.parse(s) };
      } catch { throw new AIError('PARSE_ERROR', 'Failed to parse JSON from openai-compat response'); }
    }
    return response;
  }
}
