import { Locale } from './config';

export const aiLocaleConfig = {
    en: {
        languageInstruction: 'Respond in English.',
        toneGuidance: 'Use a warm, encouraging, professional tone.',
        dateParsingHints: 'Parse English date expressions: "tomorrow", "next Monday", "in 3 days", "end of month".',
    },
    hi: {
        languageInstruction: 'Respond in Hindi (हिन्दी) using Devanagari script. You may naturally mix common English words (Hinglish) as Indians do — tech terms, "task", "project", "deadline" can stay English.',
        toneGuidance: 'Use a warm, encouraging, friendly tone. Address user informally with तुम (not आप unless in formal contexts like billing). Sound like a helpful Indian friend, not a robot. Mix Hindi and English naturally.',
        dateParsingHints: `
Parse both Hindi and English date expressions:

Hindi dates:
- "कल" = tomorrow OR yesterday (context-dependent, usually tomorrow for future tasks)
- "परसों" = day after tomorrow
- "आज" = today
- "अगले सोमवार" / "अगले मंगलवार" etc. = next Monday/Tuesday etc.
- "इस सोमवार" = this coming Monday
- "3 दिन बाद" = in 3 days
- "2 हफ्ते बाद" = in 2 weeks
- "महीने के अंत तक" = end of month

Also parse English dates (many Indians use English dates):
- "tomorrow", "next Monday", "in 3 days" etc.

Current date: ${new Date().toISOString().split('T')[0]}
Day of week: ${new Date().toLocaleDateString('hi-IN', { weekday: 'long' })}
    `.trim(),
    },
    es: {
        languageInstruction: 'Respond in Spanish (Español).',
        toneGuidance: 'Use a warm and encouraging tone. Use informal "tú" instead of "usted".',
        dateParsingHints: 'Parse Spanish date expressions: "mañana", "lunes que viene", "en 3 días".',
    },
    ar: {
        languageInstruction: 'Respond in Modern Standard Arabic (العربية الفصحى). Use Arabic script.',
        toneGuidance: 'Use a respectful, encouraging tone. Formal but warm.',
        dateParsingHints: 'Parse Arabic date expressions: "غداً" (tomorrow), "أمس" (yesterday), "الاثنين القادم" (next Monday), "بعد 3 أيام" (in 3 days).',
    },
    'pt-BR': {
        languageInstruction: 'Respond in Brazilian Portuguese.',
        toneGuidance: 'Use an upbeat, encouraging tone. Informality is preferred.',
        dateParsingHints: 'Parse Portuguese date expressions: "amanhã", "próxima segunda", "em 3 dias".',
    },
    de: {
        languageInstruction: 'Respond in German (Deutsch).',
        toneGuidance: 'Use a direct but friendly tone. Use informal "du".',
        dateParsingHints: 'Parse German date expressions: "morgen", "nächsten Montag", "in 3 Tagen".',
    },
    ja: {
        languageInstruction: 'Respond in Japanese (日本語). Use polite/です・ます form.',
        toneGuidance: 'Use polite Japanese (丁寧語). Professional yet approachable. Avoid overly casual language.',
        dateParsingHints: 'Parse Japanese date expressions: "明日" (tomorrow), "来週の月曜日" (next Monday), "3日後" (in 3 days), "月末" (end of month).',
    },
    'zh-CN': {
        languageInstruction: 'Respond in Simplified Chinese (简体中文).',
        toneGuidance: 'Use an encouraging and clear tone.',
        dateParsingHints: 'Parse Chinese date expressions: "明天", "下周一", "3天后".',
    }
};

/**
 * Prepends locale-specific instructions to any base AI System Prompt.
 * Guarantees that while structural JSON output keys remain stable,
 * the conversational tone and NLP processing respects the user's language.
 */
export function buildSystemPrompt(basePrompt: string, locale: Locale): string {
    const config = aiLocaleConfig[locale] || aiLocaleConfig['en'];

    return `
--- LOCALE CONTEXT ---
${config.languageInstruction}
${config.toneGuidance}
${config.dateParsingHints}
----------------------

${basePrompt}
  `.trim();
}
