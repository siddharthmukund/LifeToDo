'use client';
import { useCallback } from 'react';
import { shareOutbound } from './shareSender';

/**
 * Hook for initiating outbound native share sheets.
 */
export function useShareSender() {
    const share = useCallback(async (title: string, text: string, url?: string) => {
        return await shareOutbound({
            title,
            text,
            url,
            dialogTitle: title,
        });
    }, []);

    return { share };
}
