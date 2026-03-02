export const weeklyReportSchema = {
    type: 'object',
    properties: {
        summary: {
            type: 'string',
            description: 'A 2-3 sentence encouraging summary of the week.'
        },
        strengths: {
            type: 'array',
            items: { type: 'string' },
            description: '2 key areas where the user excelled (e.g. Cleared 5 high-energy tasks).'
        },
        bottlenecks: {
            type: 'array',
            items: { type: 'string' },
            description: '1-2 areas of friction (e.g. 4 calls were deferred).'
        },
        focusForNextWeek: {
            type: 'string',
            description: 'A single, clear piece of strategic advice for next week.'
        }
    },
    required: ['summary', 'strengths', 'bottlenecks', 'focusForNextWeek']
};

export interface WeeklyReportResult {
    summary: string;
    strengths: string[];
    bottlenecks: string[];
    focusForNextWeek: string;
}
