'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Shield, X } from 'lucide-react';
import { useAIConsent } from '@/ai/useAIConsent';

export function AIConsentDialog() {
  const { showDialog, providerName, grant, dismissDialog } = useAIConsent();

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
                  <h2 className="text-lg font-bold text-content-primary">AI Features</h2>
                </div>
                <button onClick={dismissDialog}><X className="w-4 h-4 text-content-muted" /></button>
              </div>

              <p className="text-sm text-content-secondary leading-relaxed">
                Life To Do uses AI to help you capture, clarify, and review your tasks.
                When you use AI features, your task text is sent to{' '}
                <strong className="text-content-primary">{providerName}</strong> for processing.
              </p>

              <div className="flex items-start gap-2 p-3 bg-surface-card rounded-xl border border-border-subtle">
                <Shield className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" />
                <p className="text-xs text-content-secondary">
                  Your data is <strong>not stored or used for training</strong>. Task details, projects, and inbox contents are processed and discarded. You can turn AI off anytime in Settings.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={grant}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm"
                >
                  Enable AI Features
                </button>
                <button
                  onClick={dismissDialog}
                  className="w-full py-2.5 text-content-secondary text-sm hover:text-content-primary"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
