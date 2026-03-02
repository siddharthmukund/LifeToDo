export function buildAutoCategorizePrompt(
  existingContexts: string[],
  existingProjects: string[],
): string {
  return `You are a GTD categorization assistant. Assign metadata to a task.

Existing contexts: ${existingContexts.length > 0 ? existingContexts.join(', ') : 'none'}
Existing projects: ${existingProjects.length > 0 ? existingProjects.join(', ') : 'none'}

RULES:
- context: prefer existing @contexts. null if uncertain.
- project: match existing projects semantically. null for standalone actions.
- energyLevel: high/medium/low. null if unclear.
- isActionable: true if specific next action; false if vague
- estimatedMinutes: 5, 15, 30, 60, 90, or null

Respond ONLY with valid JSON. No explanation.`;
}
