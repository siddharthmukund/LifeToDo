'use client';
import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useAIConsent } from '@/ai/useAIConsent';
import { useAI } from '@/ai/useAI';

export function AISettingsSection() {
  const { hasConsent, providerName, revoke, grant } = useAIConsent();
  const { isOnline } = useAI();
  const [confirming, setConfirming] = useState(false);

  async function handleToggle() {
    if (hasConsent) {
      if (!confirming) { setConfirming(true); return; }
      await revoke();
      setConfirming(false);
    } else {
      await grant();
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-content-primary flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary" />
        AI Coach
      </h3>

      <div className="rounded-xl border border-border-subtle bg-surface-card divide-y divide-border-subtle">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-content-primary">AI features</p>
            <p className="text-xs text-content-muted">
              {hasConsent ? `Powered by ${providerName}` : 'Disabled'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={!isOnline && !hasConsent}
            className={`w-11 h-6 rounded-full transition-colors ${hasConsent ? 'bg-primary' : 'bg-border-default'}`}
          >
            <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${hasConsent ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {hasConsent && (
          <div className="flex items-center justify-between px-4 py-3 opacity-60">
            <div>
              <p className="text-sm text-content-primary">Provider</p>
              <p className="text-xs text-content-muted">{providerName}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-content-muted" />
          </div>
        )}
      </div>

      {confirming && (
        <div className="p-3 rounded-xl bg-status-danger/5 border border-status-danger/20 space-y-2">
          <p className="text-sm text-content-primary">Turn off AI features?</p>
          <div className="flex gap-2">
            <button onClick={() => { void revoke(); setConfirming(false); }} className="px-3 py-1.5 bg-status-danger text-white rounded-lg text-xs">
              Disable AI
            </button>
            <button onClick={() => setConfirming(false)} className="px-3 py-1.5 border border-border-default rounded-lg text-xs text-content-secondary">
              Keep enabled
            </button>
          </div>
        </div>
      )}

      {!isOnline && !hasConsent && (
        <p className="text-xs text-content-muted">Requires internet to enable</p>
      )}
    </div>
  );
}
