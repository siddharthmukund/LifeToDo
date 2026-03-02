import { IntlMessageFormat } from 'intl-messageformat';

// Core formatters for the background cloud functions (e.g. Firebase Push)
// No React hooks allowed here

export function formatMessageServer(
    messageTpl: string,
    payload: Record<string, any>,
    locale: string = 'en'
): string {
    try {
        const msg = new IntlMessageFormat(messageTpl, locale);
        return msg.format(payload) as string;
    } catch (err) {
        console.warn(`[formatMessageServer] Failed to format template. Returning raw.`, err);
        return messageTpl;
    }
}
