import { callAIProxy } from '../aiProxy';
import { buildAutoCategorizePrompt } from '../prompts/autoCategorize';
import { categorizeResultSchema } from '../schemas/categorizeResult';
import type { CategorizeResult } from '../schemas/categorizeResult';
import type { AIContext } from '../types';
import { matchContext, matchProject } from './categoryMatcher';

export async function autoCategorize(
  taskTitle: string,
  context: AIContext,
): Promise<CategorizeResult> {
  const response = await callAIProxy({
    feature: 'auto_categorize',
    systemPrompt: buildAutoCategorizePrompt(
      context.existingContexts ?? [],
      context.existingProjects ?? [],
    ),
    userMessage: `Task: "${taskTitle}"`,
    schema: categorizeResultSchema,
    temperature: 0.1,
    maxTokens: 256,
  });

  const raw = response.parsed as CategorizeResult;

  // Run fuzzy matching on suggestions
  return {
    ...raw,
    context: matchContext(raw.context, context.existingContexts ?? []),
    project: matchProject(raw.project, context.existingProjects ?? []),
  };
}

export async function autoCategorizeBatch(
  tasks: string[],
  context: AIContext,
): Promise<CategorizeResult[]> {
  return Promise.all(tasks.map((t) => autoCategorize(t, context)));
}
