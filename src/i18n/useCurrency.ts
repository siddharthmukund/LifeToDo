'use client';

import { useLocale } from 'next-intl';
import { LOCALE_METADATA } from './config';

export function useCurrency() {
    const locale = useLocale();
    const meta = LOCALE_METADATA[locale as keyof typeof LOCALE_METADATA] ?? LOCALE_METADATA.en;
    const intlLocale = locale === 'hi' ? 'hi-IN' : locale === 'ar' ? 'ar-SA' : locale === 'ja' ? 'ja-JP' : locale === 'zh-CN' ? 'zh-CN' : locale === 'pt-BR' ? 'pt-BR' : `${locale}-${locale.toUpperCase()}`;

    return {
        format: (amount: number, currency?: string) => {
            const currencyCode = currency ?? meta.currency;

            // No decimals for whole amounts in zero-decimal-display currencies (JPY, INR when whole)
            const isWholeAmount = amount % 1 === 0;
            const noDecimals = currencyCode === 'JPY' || (currencyCode === 'INR' && isWholeAmount);

            return new Intl.NumberFormat(intlLocale, {
                style: 'currency',
                currency: currencyCode,
                ...(noDecimals && { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
            }).format(amount);
        },

        subscription: (amount: number, period: 'month' | 'year') => {
            const currencyCode = meta.currency;
            const isWholeAmount = amount % 1 === 0;
            const noDecimals = currencyCode === 'JPY' || (currencyCode === 'INR' && isWholeAmount);

            const formatted = new Intl.NumberFormat(intlLocale, {
                style: 'currency',
                currency: currencyCode,
                ...(noDecimals && { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
            }).format(amount);

            const periodSuffix: Record<string, { month: string; year: string }> = {
                hi: { month: 'महीना', year: 'साल' },
                ar: { month: 'شهر', year: 'سنة' },
                de: { month: 'Monat', year: 'Jahr' },
                es: { month: 'mes', year: 'año' },
                ja: { month: '月', year: '年' },
                'pt-BR': { month: 'mês', year: 'ano' },
                'zh-CN': { month: '月', year: '年' },
            };

            const suffix = periodSuffix[locale]?.[period] ?? period;
            return `${formatted}/${suffix}`;
        },
    };
}
