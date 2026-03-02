'use client';

import { useLocale, useTranslations } from 'next-intl';

export function useCurrency() {
    const locale = useLocale();
    const t = useTranslations('billing');

    return {
        format: (amount: number, currency?: string) => {
            const currencyCode = currency || (locale === 'hi' ? 'INR' : 'USD');

            if (currencyCode === 'INR' && amount % 1 === 0) {
                return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
                    style: 'currency',
                    currency: currencyCode,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount);
            }

            return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        },

        subscription: (amount: number, period: 'month' | 'year') => {
            const formatted = new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
                style: 'currency',
                currency: 'USD', // Temporary fallback, logic can be updated
            }).format(amount);

            const periodText = period === 'month' ? t('pricing.monthly').split('/')[1] : t('pricing.yearly').split('/')[1];
            // Since we interpolate in Hindi as {price}/महीना, let's just use the direct pricing format from billing
            // A more robust way:
            if (locale === 'hi') {
                return period === 'month' ? `${formatted}/महीना` : `${formatted}/साल`;
            }
            return `${formatted}/${period}`;
        },
    };
}
