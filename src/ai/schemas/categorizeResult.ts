export const categorizeResultSchema = {
  type: 'object',
  properties: {
    context: { type: ['string', 'null'] },
    project: { type: ['string', 'null'] },
    energyLevel: { type: ['string', 'null'], enum: ['high', 'medium', 'low', null] },
    isActionable: { type: 'boolean' },
    estimatedMinutes: { type: ['number', 'null'] },
  },
  required: ['isActionable'],
};

export interface CategorizeResult {
  context: string | null;
  project: string | null;
  energyLevel: 'high' | 'medium' | 'low' | null;
  isActionable: boolean;
  estimatedMinutes: number | null;
}
