import { useState, useRef } from 'react';
import { useAI } from '../useAI';
import { useGTDStore as useStore } from '../../store/gtdStore';
import { AutoCategorizer } from './AutoCategorizer';
import { CategorizeResult } from '../schemas/categorizeResult';
import { matchCategory } from './categoryMatcher';

export function useAutoCategorize() {
    const ai = useAI('auto_categorize');
    const categorizer = useRef(new AutoCategorizer(ai.callAI)).current;

    // Store access to find IDs based on the LLM string output
    const store = useStore();

    const [isCategorizing, setIsCategorizing] = useState(false);
    const [result, setResult] = useState<CategorizeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const categorize = async (
        taskText: string,
        autoApplyToId?: string // Optional: if provided, immediately updates the item in the store
    ) => {
        if (!ai.isAvailable) {
            setError('AI Categorizer is disabled or lacks consent.');
            return null;
        }

        if (taskText.trim().length === 0) return null;

        setIsCategorizing(true);
        setError(null);
        setResult(null);

        const currentContexts = store.contexts.map((c: any) => c.name);
        const currentProjects = store.projects.map((p: any) => p.name);

        try {
            const res = await categorizer.categorize(taskText, currentContexts, currentProjects);
            setResult(res);

            if (autoApplyToId) {
                // Perform fuzzy matching to map string -> ID
                const contextId = matchCategory(res.context, store.contexts);
                const projectId = matchCategory(res.project, store.projects);

                store.updateAction(autoApplyToId, {
                    contextId: contextId || undefined,
                    projectId: projectId || undefined,
                    energy: (res.energyLevel as any) || undefined,
                    timeEstimate: (res.estimatedMinutes as any) || undefined
                });
            }

            return res;
        } catch (err: any) {
            console.error('[AutoCategorize] Error:', err);
            setError(err.message || 'Failed to categorize task.');
            return null;
        } finally {
            setIsCategorizing(false);
        }
    };

    return {
        categorize,
        isCategorizing,
        result,
        error,
        clearResult: () => setResult(null),
        clearError: () => setError(null)
    };
}
