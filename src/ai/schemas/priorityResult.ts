export const priorityResultSchema = {
  type: 'object',
  properties: {
    pickedTaskIndex: { type: 'number' },
    taskTitle: { type: 'string' },
    reason: { type: 'string' },
    confidence: { type: 'number' },
  },
  required: ['pickedTaskIndex', 'taskTitle', 'reason', 'confidence'],
};

export interface PriorityResult {
  pickedTaskIndex: number;
  taskTitle: string;
  reason: string;
  confidence: number;
}
