import { useAI } from '../useAI';
import { buildCoachInsightPrompt } from '../prompts/coachInsight';

export class CoachInsight {
    constructor(private caller: ReturnType<typeof useAI>['callAI']) { }

    async getInsight(
        inboxCount: number,
        oldItemsCount: number,
        gtdHealthScore: number,
        daysUntilReview: number
    ): Promise<string> {
        const prompt = buildCoachInsightPrompt(
            inboxCount,
            oldItemsCount,
            gtdHealthScore,
            daysUntilReview
        );

        // We do not require a structured JSON schema for a single-sentence insight
        const response = await this.caller(prompt, "Give me an insight.", undefined, undefined);

        return response.content.trim();
    }
}
