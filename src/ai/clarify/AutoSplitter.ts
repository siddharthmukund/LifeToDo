import { callAIProxy } from '../aiProxy';
import { buildAutoSplitPrompt } from '../prompts/autoSplit';
import { splitResultSchema } from '../schemas/splitResult';
import type { SplitResult } from '../schemas/splitResult';
import type { AIContext } from '../types';

export async function autoSplitTask(taskTitle: string, context: AIContext): Promise<SplitResult> {
  const response = await callAIProxy({
    feature: 'auto_split',
    systemPrompt: buildAutoSplitPrompt(context.existingContexts ?? [], context.existingProjects ?? []),
    userMessage: `Task to split: "${taskTitle}"`,
    schema: splitResultSchema,
    temperature: 0.3,
    maxTokens: 512,
  });
  return response.parsed as SplitResult;
}
