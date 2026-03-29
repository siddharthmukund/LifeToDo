export function buildPriorityPickerPrompt(
  tasks: Array<{ index: number; title: string; context?: string; dueDate?: string; energy?: string; estimatedMinutes?: number }>,
  currentEnergy: string,
  excludeIndices: number[],
  isADHDMode: boolean = false
): string {
  const available = tasks.filter((t) => !excludeIndices.includes(t.index));
  const taskList = available
    .map((t) => {
      const parts = [`${t.index}. "${t.title}"`];
      if (t.context) parts.push(t.context);
      if (t.dueDate) parts.push(`due ${t.dueDate}`);
      if (t.energy) parts.push(`${t.energy} energy`);
      if (t.estimatedMinutes) parts.push(`~${t.estimatedMinutes}min`);
      return parts.join(' — ');
    })
    .join('\n');
  return `You are a GTD focus coach. Pick THE ONE task the user should do right now.

User energy: ${currentEnergy}
Available tasks:
${taskList}

Priority order: 1) Due today/overdue 2) Energy match 3) Shorter tasks 4) Momentum/small wins

RULES:
- Pick exactly one task
- pickedTaskIndex: the number from the list
- reason: ${isADHDMode ? 'highly direct, simple command like "Do this one next." (<8 words)' : 'ONE encouraging sentence <20 words'}
- confidence: 0.0-1.0

Respond ONLY with valid JSON.`;
}
