'use client';

import { useLocale } from 'next-intl';

export function useFormattedDate() {
    const locale = useLocale();

    return {
        long: (date: Date) => new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', { dateStyle: 'long' }).format(date),
        short: (date: Date) => new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', { dateStyle: 'short' }).format(date),
        dayName: (date: Date) => new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long' }).format(date),
        time: (date: Date) => {
            const formatted = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(date);

            if (locale === 'hi') {
                return formatted
                    .replace(/am/i, 'सुबह')
                    .replace(/pm/i, date.getHours() >= 16 ? 'शाम' : 'दोपहर');
            }

            return formatted;
        },
        dayTime: (date: Date) => {
            const day = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long' }).format(date);
            const timeRaw = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
            let time = timeRaw;
            if (locale === 'hi') time = timeRaw.replace(/am/i, 'सुबह').replace(/pm/i, date.getHours() >= 16 ? 'शाम' : 'दोपहर');
            return `${day}, ${time}`;
        },
    };
}
