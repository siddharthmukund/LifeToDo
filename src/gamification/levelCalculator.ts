import { LEVEL_DEFINITIONS } from './levels';
import { MAX_LEVEL } from './constants';

export function xpToLevel(totalXP: number): number {
    let highestLevel = 1;
    for (const def of LEVEL_DEFINITIONS) {
        if (totalXP >= def.xpRequired) {
            highestLevel = def.level;
        } else {
            break;
        }
    }
    return Math.min(highestLevel, MAX_LEVEL);
}

export function xpForNextLevel(totalXP: number): number {
    const currentLevel = xpToLevel(totalXP);
    if (currentLevel >= MAX_LEVEL) return 0;

    const nextLevelDef = LEVEL_DEFINITIONS.find(d => d.level === currentLevel + 1);
    if (!nextLevelDef) return 0;

    return Math.max(0, nextLevelDef.xpRequired - totalXP);
}

export function getLevelDefinition(level: number) {
    return LEVEL_DEFINITIONS.find(d => d.level === level) || LEVEL_DEFINITIONS[0];
}
