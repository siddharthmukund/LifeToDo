'use client';
import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props { feature?: string; }

export function AIOfflineNotice({ feature }: Props) {
  const t = useTranslations('ai.coach');
  const featureName = feature ?? t('consent.title');

  return (
    <div className="flex items-center gap-1.5 text-xs text-content-muted">
      <WifiOff className="w-3.5 h-3.5" />
      <span>{t('offline.message', { feature: featureName })}</span>
    </div>
  );
}
