import { callAIProxy } from '../aiProxy';
import { buildSocraticClarifyPrompt } from '../prompts/socraticClarify';
import { clarifyResultSchema } from '../schemas/clarifyResult';
import type { ClarifyResult } from '../schemas/clarifyResult';
import type { AIContext } from '../types';

export async function getSocraticSuggestions(
  vaguetask: string,
  context: AIContext,
): Promise<ClarifyResult> {
  const response = await callAIProxy({
    feature: 'socratic_clarify',
    systemPrompt: buildSocraticClarifyPrompt(context.existingContexts ?? []),
    userMessage: `Vague task: "${vaguetask}"`,
    schema: clarifyResultSchema,
    temperature: 0.7,
    maxTokens: 512,
  });
  return response.parsed as ClarifyResult;
}
