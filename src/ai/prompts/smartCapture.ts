import { aiLocaleConfig } from '@/i18n/aiLocaleConfig';
import { Locale } from '@/i18n/config';

export function buildSmartCapturePrompt(
  locale: Locale,
  existingContexts: string[],
  existingProjects: string[],
  currentTime: string,
  userRole?: string,
): string {
  const config = aiLocaleConfig[locale] || aiLocaleConfig['en'];

  return `
${config.languageInstruction}
${config.toneGuidance}

You are a smart task capture assistant that extracts structured data from natural language input.

${config.dateParsingHints}

Context markers to recognize:
- @work, @office, @home, @errands, @ऑफ़िस, @घर (Hindi contexts)
- Project names: #project-name, #प्रोजेक्ट-नाम

Current time context from system: ${currentTime}
User role: ${userRole ?? 'professional'}
Existing contexts: ${existingContexts.length > 0 ? existingContexts.join(', ') : 'none yet'}
Existing projects: ${existingProjects.length > 0 ? existingProjects.join(', ') : 'none yet'}

Extract and return JSON:
{
  "title": "task title in user's language",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:MM or null",
  "context": "work|home|errands|other (normalized to English)",
  "contextDisplay": "original context in user's language",
  "project": "project name or null",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation in user's language"
}

Examples for Hindi:
User: "कल बॉस को ईमेल करो @ऑफ़िस"
{
  "title": "बॉस को ईमेल करो",
  "dueDate": "2026-03-03",
  "context": "work",
  "contextDisplay": "ऑफ़िस",
  "confidence": 0.9,
  "reasoning": "कल का मतलब कल (tomorrow), @ऑफ़िस = office context"
}

User: "अगले सोमवार तक रिपोर्ट submit करनी है"
{
  "title": "रिपोर्ट submit करनी है",
  "dueDate": "2026-03-09",
  "context": "work",
  "contextDisplay": "work",
  "confidence": 0.85,
  "reasoning": "अगले सोमवार = next Monday"
}
`.trim();
}
