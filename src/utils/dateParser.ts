import { startOfWeek, endOfWeek, endOfMonth, addWeeks, addDays, addMonths, parseISO, isValid } from 'date-fns';

export function parseRelativeDate(input: string): Date | null {
    if (!input) return null;

    const trimmed = input.trim().toLowerCase();

    const now = new Date();

    if (trimmed === 'today') {
        return now;
    }
    if (trimmed === 'tomorrow') {
        return addDays(now, 1);
    }
    if (trimmed === 'yesterday') {
        return addDays(now, -1);
    }

    if (trimmed === 'next week') {
        return startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
    }
    if (trimmed === 'next monday') {
        const currentDay = now.getDay();
        const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
        return addDays(now, daysUntilNextMonday);
    }

    if (trimmed === 'end of week') {
        return endOfWeek(now, { weekStartsOn: 1 });
    }
    if (trimmed === 'end of month') {
        return endOfMonth(now);
    }

    const inDaysPattern = trimmed.match(/^in (\d+) days?$/);
    if (inDaysPattern) {
        return addDays(now, parseInt(inDaysPattern[1]));
    }

    const inMonthsPattern = trimmed.match(/^in (\d+) months?$/);
    if (inMonthsPattern) {
        return addMonths(now, parseInt(inMonthsPattern[1]));
    }

    const specificMonthDay = trimmed.match(/^([a-z]+)\s+(\d{1,2})$/i);
    if (specificMonthDay) {
        const fallback = new Date(`${input} ${now.getFullYear()} 12:00:00`);
        if (!isNaN(fallback.getTime())) return fallback;
    }

    const isoStrict = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoStrict) {
        // Construct standard local date at noon to bypass Node.js UTC parsing offset drifts backwards
        return new Date(parseInt(isoStrict[1]), parseInt(isoStrict[2]) - 1, parseInt(isoStrict[3]), 12, 0, 0);
    }

    const isoDate = parseISO(input);
    if (isValid(isoDate)) {
        return isoDate;
    }

    // Attempt native JS explicit human string parsing wrapper
    const fallback = new Date(input);
    if (!isNaN(fallback.getTime())) {
        return fallback;
    }

    return null;
}
