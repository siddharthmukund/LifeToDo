import { callAIProxy } from '../aiProxy';
import { buildPriorityPickerPrompt } from '../prompts/priorityPicker';
import { priorityResultSchema } from '../schemas/priorityResult';
import type { PriorityResult } from '../schemas/priorityResult';

export interface PickerTask {
  index: number;
  title: string;
  context?: string;
  dueDate?: string;
  energy?: string;
  estimatedMinutes?: number;
}

export async function pickPriorityTask(
  tasks: PickerTask[],
  currentEnergy: string,
  excludeIndices: number[],
): Promise<PriorityResult> {
  const response = await callAIProxy({
    feature: 'priority_picker',
    systemPrompt: buildPriorityPickerPrompt(tasks, currentEnergy, excludeIndices),
    userMessage: 'Pick the best task for right now.',
    schema: priorityResultSchema,
    temperature: 0.2,
    maxTokens: 256,
  });
  return response.parsed as PriorityResult;
}
