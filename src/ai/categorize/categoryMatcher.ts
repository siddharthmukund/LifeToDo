interface Entity {
    id: string;
    name: string;
}

/**
 * Fuzzy matches a string name against an array of entity objects (contexts/projects),
 * returning the ID of the matched entity, or null if no confident match is found.
 */
export function matchCategory(suggestedName: string | null | undefined, list: Entity[]): string | null {
    if (!suggestedName || !list || list.length === 0) return null;

    const lowerSug = suggestedName.toLowerCase().replace(/^@/, '').trim();

    // 1. Exact Match
    const exact = list.find(e => e.name.toLowerCase().replace(/^@/, '').trim() === lowerSug);
    if (exact) return exact.id;

    // 2. Contains Match (e.g. LLM said "Groceries", Context is "Errands - Groceries")
    const contains = list.find(e => e.name.toLowerCase().includes(lowerSug) || lowerSug.includes(e.name.toLowerCase()));
    if (contains) return contains.id;

    // We do not auto-create on mismatches silently to prevent DB bloat. 
    // Return null and let the user handle it if fuzzy mapping fails.
    return null;
}
