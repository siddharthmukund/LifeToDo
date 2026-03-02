export const splitResultSchema = {
  type: 'object',
  properties: {
    subtasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          context: { type: ['string', 'null'] },
          energyLevel: { type: ['string', 'null'], enum: ['high', 'medium', 'low', null] },
          order: { type: 'number' },
        },
        required: ['title', 'order'],
      },
    },
    suggestProject: { type: 'boolean' },
    projectName: { type: ['string', 'null'] },
  },
  required: ['subtasks', 'suggestProject'],
};

export interface SplitSubtask {
  title: string;
  context: string | null;
  energyLevel: 'high' | 'medium' | 'low' | null;
  order: 1 | 2 | 3;
}

export interface SplitResult {
  subtasks: SplitSubtask[];
  suggestProject: boolean;
  projectName: string | null;
}
