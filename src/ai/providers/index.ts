import type { AIProvider } from '../aiProvider';
import type { AIConfig } from '../aiConfig';
import { AIError } from '../types';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { ClaudeProvider } from './claude';
import { MistralProvider } from './mistral';
import { OpenAICompatProvider } from './openaiCompat';

let _provider: AIProvider | null = null;

export function resolveProvider(config: AIConfig): AIProvider {
  if (_provider) return _provider;
  switch (config.provider) {
    case 'gemini': _provider = new GeminiProvider(config); break;
    case 'openai': _provider = new OpenAIProvider(config); break;
    case 'claude': _provider = new ClaudeProvider(config); break;
    case 'mistral': _provider = new MistralProvider(config); break;
    case 'openai-compat': _provider = new OpenAICompatProvider(config); break;
    default: throw new AIError('UNSUPPORTED_PROVIDER', `Unknown provider: ${config.provider}`);
  }
  return _provider;
}

export function resetProvider(): void { _provider = null; }
export type { AIProvider };
