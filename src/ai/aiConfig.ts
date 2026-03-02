import type { AIProviderName } from './types';

export interface AIConfig {
  provider: AIProviderName;
  model: string;
  apiEndpoint?: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  timeoutMs: number;
}

const MODEL_DEFAULTS: Record<AIProviderName, string> = {
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
  claude: 'claude-3-5-haiku-20241022',
  mistral: 'mistral-small-latest',
  'openai-compat': 'llama3.2',
};

export const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  'gemini-2.0-flash': 1_000_000,
  'gemini-1.5-pro': 1_000_000,
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'claude-3-5-haiku-20241022': 200_000,
  'claude-3-5-sonnet-20241022': 200_000,
  'mistral-small-latest': 32_000,
  llama3: 8_000,
  default: 8_000,
};

export const FEATURE_TEMPERATURES: Record<string, number> = {
  smart_capture: 0.1,
  brain_dump: 0.2,
  socratic_clarify: 0.7,
  auto_split: 0.3,
  auto_categorize: 0.1,
  coach_insight: 0.6,
  review_coach: 0.7,
  weekly_report: 0.6,
  priority_picker: 0.2,
  content_drafter: 0.7,
};

export function buildAIConfig(): AIConfig {
  const provider = (
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_AI_PROVIDER : undefined) ?? 'gemini'
  ) as AIProviderName;
  const modelOverride =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_AI_MODEL : undefined;

  return {
    provider,
    model: modelOverride ?? MODEL_DEFAULTS[provider] ?? MODEL_DEFAULTS.gemini,
    apiEndpoint:
      typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_AI_ENDPOINT : undefined,
    defaultTemperature: 0.3,
    defaultMaxTokens: 1024,
    timeoutMs: 10_000,
  };
}

export const AI_CONFIG = buildAIConfig();

export const AI_PROXY_URL =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_AI_PROXY_URL : undefined) ??
  '/api/ai/proxy';

export const CLIENT_RATE_LIMIT = {
  maxCallsPerMinute: 30,
  maxCallsPerDay: 200,
};
