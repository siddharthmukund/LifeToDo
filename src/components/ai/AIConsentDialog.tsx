'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, Shield, X } from 'lucide-react';
import { useAIConsent } from '@/ai/useAIConsent';

export function AIConsentDialog() {
  const { showDialog, providerName, grant, dismissDialog } = useAIConsent();
  const t = useTranslations('ai.coach');

  return (
    <AnimatePresence>
      {showDialog && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-x-4 bottom-0 z-50 pb-safe max-w-md mx-auto"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="bg-surface-base rounded-t-2xl p-6 space-y-5 border-t border-border-subtle shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-content-primary">{t('consent.title')}</h2>
                </div>
                <button onClick={dismissDialog} aria-label={t('consent.dismiss')}>
                  <X className="w-4 h-4 text-content-muted" />
                </button>
              </div>

              <p className="text-sm text-content-secondary leading-relaxed">
                {t('consent.description', { providerName })}
              </p>

              <div className="flex items-start gap-2 p-3 bg-surface-card rounded-xl border border-border-subtle">
                <Shield className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" />
                <p className="text-xs text-content-secondary">{t('consent.privacy')}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={grant}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm"
                >
                  {t('consent.enable')}
                </button>
                <button
                  onClick={dismissDialog}
                  className="w-full py-2.5 text-content-secondary text-sm hover:text-content-primary"
                >
                  {t('consent.dismiss')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
