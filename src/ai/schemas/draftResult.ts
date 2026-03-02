export const draftResultSchema = {
  type: 'object',
  properties: {
    draft: { type: 'string' },
    draftType: { type: 'string', enum: ['email', 'message', 'outline', 'talking_points', 'general'] },
    suggestedSubject: { type: ['string', 'null'] },
  },
  required: ['draft', 'draftType'],
};

export interface DraftResult {
  draft: string;
  draftType: 'email' | 'message' | 'outline' | 'talking_points' | 'general';
  suggestedSubject: string | null;
}
