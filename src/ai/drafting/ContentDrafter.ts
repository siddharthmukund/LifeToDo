import { useAI } from '../useAI';
import { buildContentDraftPrompt, DraftType } from '../prompts/contentDraft';
import { draftResultSchema, DraftResult } from '../schemas/draftResult';

export class ContentDrafter {
    constructor(private caller: ReturnType<typeof useAI>['callAI']) { }

    async generateDraft(
        taskText: string,
        draftType: DraftType,
        additionalContext?: string
    ): Promise<DraftResult> {

        const prompt = buildContentDraftPrompt(taskText, draftType, additionalContext);

        const response = await this.caller(
            prompt,
            "Draft this for me.",
            draftResultSchema
        );

        if (!response.parsed) {
            throw new Error('Failed to generate structured draft');
        }

        if (typeof response.parsed === 'string') {
            return JSON.parse(response.parsed) as DraftResult;
        }

        return response.parsed as DraftResult;
    }
}
