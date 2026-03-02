// Fuzzy match LLM suggestions to existing contexts/projects

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Common context aliases
const CONTEXT_ALIASES: Record<string, string> = {
  '@work': '@office',
  '@computer': '@office',
  '@desk': '@office',
  '@phone': '@calls',
  '@telephone': '@calls',
  '@store': '@errands',
  '@shops': '@errands',
  '@outside': '@errands',
  '@house': '@home',
  '@apartment': '@home',
};

export function matchContext(suggestion: string | null, existingContexts: string[]): string | null {
  if (!suggestion) return null;
  const raw = suggestion.startsWith('@') ? suggestion : `@${suggestion}`;
  const lower = raw.toLowerCase();

  // 1. Exact match
  const exact = existingContexts.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;

  // 2. Alias match
  const aliased = CONTEXT_ALIASES[lower];
  if (aliased) {
    const aliasMatch = existingContexts.find((c) => c.toLowerCase() === aliased.toLowerCase());
    if (aliasMatch) return aliasMatch;
  }

  // 3. Fuzzy match (Levenshtein distance ≤ 2)
  const fuzzy = existingContexts.find((c) => levenshtein(c.toLowerCase(), lower) <= 2);
  if (fuzzy) return fuzzy;

  // 4. New suggestion — return as-is
  return raw;
}

export function matchProject(suggestion: string | null, existingProjects: string[]): string | null {
  if (!suggestion) return null;
  const lower = suggestion.toLowerCase();

  const exact = existingProjects.find((p) => p.toLowerCase() === lower);
  if (exact) return exact;

  // Semantic/partial match: suggestion contained in project or vice versa
  const partial = existingProjects.find(
    (p) => p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase()),
  );
  if (partial) return partial;

  // Fuzzy
  const fuzzy = existingProjects.find((p) => levenshtein(p.toLowerCase(), lower) <= 3);
  if (fuzzy) return fuzzy;

  return suggestion; // New project
}
