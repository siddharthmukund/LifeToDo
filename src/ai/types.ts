// ─── Core AI Types ────────────────────────────────────────────────────────────

export type AIProviderName = 'gemini' | 'openai' | 'claude' | 'mistral' | 'openai-compat';

export type AIFeature =
  | 'smart_capture'
  | 'brain_dump'
  | 'socratic_clarify'
  | 'auto_split'
  | 'auto_categorize'
  | 'coach_insight'
  | 'review_coach'
  | 'weekly_report'
  | 'priority_picker'
  | 'content_drafter';

export interface AIRequest {
  feature: AIFeature;
  systemPrompt: string;
  userMessage: string;
  context?: AIContext;
  schema?: JSONSchema;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  parsed?: unknown;
  usage?: { inputTokens: number; outputTokens: number };
  provider: AIProviderName;
  model: string;
  latencyMs: number;
}

export interface AIStreamChunk {
  delta: string;
  done: boolean;
}

export type AIErrorCode =
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'AUTH_ERROR'
  | 'PROVIDER_ERROR'
  | 'PARSE_ERROR'
  | 'TIMEOUT'
  | 'UNSUPPORTED_PROVIDER'
  | 'CONSENT_REQUIRED'
  | 'OFFLINE';

export class AIError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export interface AIContext {
  locale?: string;
  existingContexts?: string[];
  existingProjects?: string[];
  inboxCount?: number;
  pendingActions?: TaskSummary[];
  completedThisWeek?: TaskSummary[];
  gtdHealthScore?: number;
  userTimezone?: string;
  currentTime?: string;
  userRole?: string;
}

export interface TaskSummary {
  title: string;
  context?: string;
  project?: string;
  energy?: string;
  dueDate?: string;
  daysOld?: number;
}

export type JSONSchema = Record<string, unknown>;
