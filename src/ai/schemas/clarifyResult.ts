export const clarifyResultSchema = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          context: { type: ['string', 'null'] },
          energyLevel: { type: ['string', 'null'], enum: ['high', 'medium', 'low', null] },
          reasoning: { type: 'string' },
        },
        required: ['title', 'reasoning'],
      },
    },
  },
  required: ['suggestions'],
};

export interface ClarifySuggestion {
  title: string;
  context: string | null;
  energyLevel: 'high' | 'medium' | 'low' | null;
  reasoning: string;
}

export interface ClarifyResult {
  suggestions: ClarifySuggestion[];
}
