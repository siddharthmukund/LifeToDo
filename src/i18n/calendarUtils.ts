/**
 * Different cultures start the week on different days
 */
export const weekStartDay: Record<string, number> = {
    'en': 0,     // Sunday
    'hi': 0,     // Sunday
    'es': 1,     // Monday
    'ar': 6,     // Saturday
    'pt-BR': 0, // Sunday
    'de': 1,     // Monday
    'ja': 0,     // Sunday
    'zh-CN': 1, // Monday
};

/**
 * Returns the logical integer for the start of the week for a given locale string.
 * Helps power standard GTD Review cycle dates.
 */
export function getWeekStart(locale: string): number {
    return weekStartDay[locale] ?? 0;
}
