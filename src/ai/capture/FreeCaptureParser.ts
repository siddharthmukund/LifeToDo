// Free-tier: pure regex + chrono-node fallback (no API call)
import { parseTaskOffline } from '../NLPParser';

export interface FreeCaptureResult {
  title: string;
  dueDate: string | null;
  context: string | null;
  project: string | null;
  energyLevel: null; // Not detected on free tier
}

export function parseCaptureFree(
  text: string,
  existingContexts: string[],
): FreeCaptureResult {
  const parsed = parseTaskOffline(text);

  // Match context: prefer existing
  let context: string | null = null;
  if (parsed.contexts.length > 0) {
    const raw = parsed.contexts[0].toLowerCase();
    const match = existingContexts.find(
      (c) => c.toLowerCase() === raw || c.toLowerCase() === `@${raw}`,
    );
    context = match ?? `@${parsed.contexts[0]}`;
  }

  // Project: use first #tag if any
  const project = parsed.projects.length > 0 ? parsed.projects[0] : null;

  // Due date: ISO string or null
  const dueDate = parsed.dueDate ? parsed.dueDate.toISOString() : null;

  return {
    title: parsed.cleanText || text,
    dueDate,
    context,
    project,
    energyLevel: null,
  };
}
