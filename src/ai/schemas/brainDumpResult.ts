export const brainDumpResultSchema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          dueDate: { type: ['string', 'null'] },
          context: { type: ['string', 'null'] },
          project: { type: ['string', 'null'] },
          energyLevel: { type: ['string', 'null'], enum: ['high', 'medium', 'low', null] },
        },
        required: ['title'],
      },
    },
    count: { type: 'number' },
  },
  required: ['tasks', 'count'],
};

export interface BrainDumpTask {
  title: string;
  dueDate: string | null;
  context: string | null;
  project: string | null;
  energyLevel: 'high' | 'medium' | 'low' | null;
}

export interface BrainDumpResult {
  tasks: BrainDumpTask[];
  count: number;
}
