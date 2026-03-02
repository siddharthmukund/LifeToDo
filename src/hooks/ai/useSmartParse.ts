import { useState, useEffect } from 'react';
import { parseTaskOffline, ParsedTask } from '@/ai/NLPParser';

export function useSmartParse(input: string, delay: number = 300) {
    const [parsed, setParsed] = useState<ParsedTask>({
        rawText: input,
        cleanText: input,
        dueDate: null,
        projects: [],
        contexts: []
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            if (!input.trim()) {
                setParsed({
                    rawText: '',
                    cleanText: '',
                    dueDate: null,
                    projects: [],
                    contexts: []
                });
                return;
            }
            try {
                const result = parseTaskOffline(input);
                setParsed(result);
            } catch (err) {
                console.error("NLP Parse Error", err);
            }
        }, delay);

        return () => clearTimeout(handler);
    }, [input, delay]);

    return parsed;
}
