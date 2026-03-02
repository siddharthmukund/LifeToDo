export type DraftType = 'email' | 'message' | 'outline' | 'brainstorm';

export const buildContentDraftPrompt = (
    taskText: string,
    draftType: DraftType,
    additionalContext?: string
) => {
    let focusInstruction = '';

    switch (draftType) {
        case 'email':
            focusInstruction = 'Draft a professional but concise email. Include a subject line.';
            break;
        case 'message':
            focusInstruction = 'Draft a quick, casual text message or Slack ping.';
            break;
        case 'outline':
            focusInstruction = 'Create a brief bulleted outline breaking down this concept.';
            break;
        case 'brainstorm':
            focusInstruction = 'Provide 3-5 creative angles or ideas related to this topic.';
            break;
    }

    return `
You are an executive assistant integrated into a GTD app. The user needs help drafting content to unblock a task.

Task: '${taskText}'
Goal: ${focusInstruction}
${additionalContext ? `Additional User Notes: '${additionalContext}'` : ''}

Be brief. Do not use corporate jargon. Provide the result as JSON matching the schema.
    `;
};
