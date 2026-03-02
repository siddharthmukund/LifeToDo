import { callAIProxy } from '../aiProxy';
import { buildBrainDumpPrompt } from '../prompts/brainDump';
import { brainDumpResultSchema } from '../schemas/brainDumpResult';
import type { BrainDumpResult } from '../schemas/brainDumpResult';
import type { AIContext } from '../types';

const MIN_CHARS = 10;
const MAX_CHARS = 8000;

export async function processBrainDump(
  text: string,
  context: AIContext,
): Promise<BrainDumpResult> {
  if (text.trim().length < MIN_CHARS) {
    throw new Error('Write a few thoughts first — the more detail, the better.');
  }

  const truncated = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + ' [truncated]' : text;
  const currentDate = new Date().toISOString().split('T')[0];

  const response = await callAIProxy({
    feature: 'brain_dump',
    systemPrompt: buildBrainDumpPrompt(
      context.existingContexts ?? [],
      context.existingProjects ?? [],
      currentDate,
    ),
    userMessage: truncated,
    schema: brainDumpResultSchema,
    temperature: 0.2,
    maxTokens: 2048,
  });

  const result = response.parsed as BrainDumpResult;
  if (!result?.tasks?.length) {
    throw new Error("I couldn't find specific tasks in this text. Try being more concrete about what you need to do.");
  }
  return result;
}
