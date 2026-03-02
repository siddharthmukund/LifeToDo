import { useState, useRef } from 'react';
import { useAI } from '../useAI';
import { ContentDrafter } from './ContentDrafter';
import { DraftResult } from '../schemas/draftResult';
import { DraftType } from '../prompts/contentDraft';

export function useContentDrafter() {
    const ai = useAI('content_drafter');
    const drafter = useRef(new ContentDrafter(ai.callAI)).current;

    const [isDrafting, setIsDrafting] = useState(false);
    const [result, setResult] = useState<DraftResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const draft = async (taskText: string, type: DraftType, additionalContext?: string) => {
        if (!ai.isAvailable) {
            setError('AI Content Drafter is disabled or lacks consent.');
            return;
        }

        if (taskText.trim().length === 0) return;

        setIsDrafting(true);
        setError(null);
        setResult(null);

        try {
            const res = await drafter.generateDraft(taskText, type, additionalContext);
            setResult(res);
        } catch (err: any) {
            console.error('[ContentDrafter] Error:', err);
            setError(err.message || 'Failed to generate draft.');
        } finally {
            setIsDrafting(false);
        }
    };

    return {
        draft,
        isDrafting,
        result,
        error,
        clear: () => {
            setResult(null);
            setError(null);
        }
    };
}
