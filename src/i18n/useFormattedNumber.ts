'use client';

import { useLocale } from 'next-intl';

export function useFormattedNumber() {
    const locale = useLocale();

    return {
        integer: (n: number) => new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US').format(n),

        percent: (n: number) => new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
            style: 'percent',
            maximumFractionDigits: 0
        }).format(n),

        compact: (n: number) => new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
            notation: 'compact',
            compactDisplay: 'short'
        }).format(n),

        lakhCrore: (n: number) => {
            if (locale !== 'hi') return new Intl.NumberFormat('en-US').format(n);

            if (n >= 10000000) {
                return `${(n / 10000000).toFixed(2).replace(/\\.00$/, '')} करोड़`;
            }
            if (n >= 100000) {
                return `${(n / 100000).toFixed(2).replace(/\\.00$/, '')} लाख`;
            }
            return new Intl.NumberFormat('hi-IN').format(n);
        },
    };
}
