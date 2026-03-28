'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AIError } from '@/ai/types';

interface Props {
  error: AIError | string | null;
  onRetry?: () => void;
  compact?: boolean;
}

export function AIErrorBanner({ error, onRetry, compact = false }: Props) {
  const t = useTranslations('ai.coach');

  if (!error) return null;

  const code = typeof error === 'string' ? 'providerError' : ((error as { code?: string }).code ?? 'PROVIDER_ERROR');

  const errorKey: Record<string, string> = {
    OFFLINE: 'errors.offline',
    RATE_LIMITED: 'errors.rateLimited',
    TIMEOUT: 'errors.timeout',
    AUTH_ERROR: 'errors.authError',
    PROVIDER_ERROR: 'errors.providerError',
    PARSE_ERROR: 'errors.parseError',
  };

  const messageKey = errorKey[code];
  const message = messageKey
    ? t(messageKey)
    : (typeof error === 'string' ? error : (error as Error).message ?? t('errors.providerError'));

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
          <RefreshCw className="w-3 h-3" /> {t('retry')}
        </button>
      )}
    </div>
  );
}
