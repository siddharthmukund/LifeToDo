import { useAI } from '../useAI';
import { buildAutoCategorizePrompt } from '../prompts/autoCategorize';
import { categorizeResultSchema, CategorizeResult } from '../schemas/categorizeResult';

export class AutoCategorizer {
    constructor(private caller: ReturnType<typeof useAI>['callAI']) { }

    async categorize(
        taskText: string,
        contexts: string[],
        projects: string[]
    ): Promise<CategorizeResult> {
        const prompt = buildAutoCategorizePrompt(contexts, projects);

        const response = await this.caller(
            prompt,
            taskText,
            categorizeResultSchema
        );

        if (!response.parsed) {
            throw new Error('Failed to get structured category data');
        }

        if (typeof response.parsed === 'string') {
            return JSON.parse(response.parsed) as CategorizeResult;
        }

        return response.parsed as CategorizeResult;
    }
}
