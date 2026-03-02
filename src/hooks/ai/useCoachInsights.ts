import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CoachBrain, CoachInsight } from '@/ai/CoachBrain';

export function useCoachInsights() {
    const [insights, setInsights] = useState<CoachInsight[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    // We use a dummy live query just to trigger re-renders 
    // when any item in projects, actions, or inbox changes.
    const lastUpdateTrigger = useLiveQuery(() =>
        Promise.all([
            db.inbox_items.count(),
            db.projects.count(),
            db.actions.count()
        ]).then(counts => counts.join('-'))
        , [], '0-0-0');

    useEffect(() => {
        let mounted = true;
        const analyze = async () => {
            setIsAnalyzing(true);
            try {
                const results = await CoachBrain.generateInsights();
                if (mounted) {
                    setInsights(results);
                }
            } catch (err) {
                console.error("Coach Brain Analysis Failed", err);
            } finally {
                if (mounted) setIsAnalyzing(false);
            }
        };

        analyze();

        return () => {
            mounted = false;
        };
    }, [lastUpdateTrigger]);

    return { insights, isAnalyzing };
}
