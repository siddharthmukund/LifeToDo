'use client';
import { useEffect, useCallback } from 'react';
import { addShareReceiverListener, removeShareReceiverListeners, SharedContent } from './shareReceiver';
import { useGTDStore } from '@/store/gtdStore';

/**
 * Hook that mounts at the root level to catch incoming shared intent payloads
 * and automatically convert them into Inbox items.
 */
export function useShareReceiver() {
    const { addInboxItem } = useGTDStore();

    const handleSharedContent = useCallback(async (content: SharedContent) => {
        let text = '';
        if (content.text) text += content.text;
        if (content.url) text += text ? `\n${content.url}` : content.url;

        if (text.trim()) {
            await addInboxItem(text.trim(), 'text');
        }
    }, [addInboxItem]);

    useEffect(() => {
        addShareReceiverListener(handleSharedContent);
        return () => {
            removeShareReceiverListeners();
        };
    }, [handleSharedContent]);
}
