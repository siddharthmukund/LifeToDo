'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { AIError } from '@/ai/types';

interface Props {
  error: AIError | string | null;
  onRetry?: () => void;
  compact?: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  OFFLINE: 'AI features require internet. Your GTD tools work fine offline.',
  RATE_LIMITED: "You've been busy! AI features will be back shortly.",
  TIMEOUT: 'Taking too long — you can fill this in manually.',
  AUTH_ERROR: 'AI configuration issue. Please check settings.',
  PROVIDER_ERROR: 'AI is having a moment — try again in a few seconds.',
  PARSE_ERROR: 'AI response was unclear — try rephrasing.',
};

export function AIErrorBanner({ error, onRetry, compact = false }: Props) {
  if (!error) return null;

  const code = typeof error === 'string' ? 'PROVIDER_ERROR' : (error as { code?: string }).code ?? 'PROVIDER_ERROR';
  const message = ERROR_MESSAGES[code] ?? (typeof error === 'string' ? error : (error as Error).message ?? 'AI unavailable');

  if (compact) {
    return (
      <span className="text-xs text-status-danger flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {message}
      </span>
    );
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-status-danger/5 border border-status-danger/20">
      <AlertCircle className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-content-primary">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      )}
    </div>
  );
}
