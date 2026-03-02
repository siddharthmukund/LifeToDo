export const captureResultSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    dueDate: { type: ['string', 'null'] },
    context: { type: ['string', 'null'] },
    project: { type: ['string', 'null'] },
    energyLevel: { type: ['string', 'null'], enum: ['high', 'medium', 'low', null] },
    confidence: {
      type: 'object',
      properties: {
        dueDate: { type: 'number' },
        context: { type: 'number' },
        project: { type: 'number' },
        energyLevel: { type: 'number' },
      },
      required: ['dueDate', 'context', 'project', 'energyLevel'],
    },
  },
  required: ['title', 'confidence'],
};

export interface CaptureResult {
  title: string;
  dueDate: string | null;
  context: string | null;
  project: string | null;
  energyLevel: 'high' | 'medium' | 'low' | null;
  confidence: { dueDate: number; context: number; project: number; energyLevel: number };
}
