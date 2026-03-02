'use client';
import { db } from '@/lib/db';
import { AI_CONFIG } from './aiConfig';

const CONSENT_KEY = 'aiCoachConsent';

export interface AIConsentState {
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  provider: string;
}

export async function getAIConsent(): Promise<AIConsentState | null> {
  try {
    const settings = await db.settings.get('singleton');
    const raw = (settings as Record<string, unknown> | undefined)?.[CONSENT_KEY];
    return (raw as AIConsentState) ?? null;
  } catch {
    return null;
  }
}

export async function grantAIConsent(): Promise<void> {
  await db.settings.update('singleton', {
    [CONSENT_KEY]: { granted: true, grantedAt: new Date().toISOString(), provider: AI_CONFIG.provider },
  });
}

export async function revokeAIConsent(): Promise<void> {
  await db.settings.update('singleton', {
    [CONSENT_KEY]: { granted: false, revokedAt: new Date().toISOString(), provider: AI_CONFIG.provider },
  });
}

export async function hasAIConsent(): Promise<boolean> {
  const c = await getAIConsent();
  return c?.granted === true;
}

export function getProviderDisplayName(provider: string): string {
  const names: Record<string, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT',
    claude: 'Anthropic Claude',
    mistral: 'Mistral AI',
    'openai-compat': 'Local AI Model',
  };
  return names[provider] ?? provider;
}
