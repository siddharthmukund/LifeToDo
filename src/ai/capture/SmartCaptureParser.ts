import { callAIProxy } from '../aiProxy';
import { buildSmartCapturePrompt } from '../prompts/smartCapture';
import { captureResultSchema } from '../schemas/captureResult';
import type { CaptureResult } from '../schemas/captureResult';
import type { AIContext } from '../types';
import type { Locale } from '@/i18n/config';

export async function parseCaptureSmart(
  text: string,
  context: AIContext,
): Promise<CaptureResult> {
  const currentTime = new Date().toLocaleString('en-CA', {
    timeZone: context.userTimezone ?? 'UTC',
    hour12: false,
  });

  const response = await callAIProxy({
    feature: 'smart_capture',
    systemPrompt: buildSmartCapturePrompt(
      (context.locale as Locale) || 'en',
      context.existingContexts ?? [],
      context.existingProjects ?? [],
      currentTime,
      context.userRole,
    ),
    userMessage: text,
    schema: captureResultSchema,
    temperature: 0.1,
    maxTokens: 512,
  });

  return response.parsed as CaptureResult;
}
