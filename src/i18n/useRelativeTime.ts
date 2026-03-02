'use client';

import { useLocale, useTranslations } from 'next-intl';

export function useRelativeTime() {
    const locale = useLocale();
    const t = useTranslations('common');

    return (date: Date | number | string): string => {
        const timeValue = date instanceof Date ? date.getTime() : new Date(date).getTime();
        if (isNaN(timeValue)) return '';
        const now = new Date();
        const diff = timeValue - now.getTime();
        const absDiff = Math.abs(diff);

        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return t('time.justNow');
        if (minutes < 60) return t('time.minutesAgo', { count: minutes });
        if (hours < 24) return t('time.hoursAgo', { count: hours });

        const isToday = now.toDateString() === new Date(timeValue).toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = tomorrow.toDateString() === new Date(timeValue).toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = yesterday.toDateString() === new Date(timeValue).toDateString();

        if (isToday) return t('time.today');
        if (isTomorrow) return t('time.tomorrow');
        if (isYesterday) return t('time.yesterday');

        if (days < 7) return t('time.daysAgo', { count: days });

        return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
            dateStyle: 'medium'
        }).format(new Date(timeValue));
    };
}
