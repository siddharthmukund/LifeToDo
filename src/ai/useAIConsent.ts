'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAIConsent, grantAIConsent, revokeAIConsent, getProviderDisplayName } from './aiConsent';
import { AI_CONFIG } from './aiConfig';

export function useAIConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const providerName = getProviderDisplayName(AI_CONFIG.provider);

  useEffect(() => {
    getAIConsent().then((s) => setHasConsent(s?.granted ?? false));
  }, []);

  const grant = useCallback(async () => {
    await grantAIConsent();
    setHasConsent(true);
    setShowDialog(false);
  }, []);

  const revoke = useCallback(async () => {
    await revokeAIConsent();
    setHasConsent(false);
  }, []);

  const requestConsent = useCallback(() => { if (!hasConsent) setShowDialog(true); }, [hasConsent]);
  const dismissDialog = useCallback(() => setShowDialog(false), []);

  return { hasConsent, showDialog, providerName, grant, revoke, requestConsent, dismissDialog };
}
