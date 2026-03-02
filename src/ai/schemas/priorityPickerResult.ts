export const priorityPickerSchema = {
    type: 'object',
    properties: {
        recommendedTaskId: {
            type: 'string',
            description: 'The exact ID of the task that should be tackled first.'
        },
        reasoning: {
            type: 'string',
            description: 'A 1-sentence pragmatic explanation of why this task is the best choice right now.'
        }
    },
    required: ['recommendedTaskId', 'reasoning']
};

export interface PriorityPickerResult {
    recommendedTaskId: string;
    reasoning: string;
}
