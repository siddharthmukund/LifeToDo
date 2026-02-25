// flags/index.ts
// Barrel export — iCCW #4 Feature Flags layer
export { FLAGS, FLAG_MAP, getFlag, isFlagProOnly } from './flags'
export { useFlagStore }                            from './flagStore'
export { useFeatureFlag }                          from './useFeatureFlag'
export { FeatureGate }                             from './FeatureGate'
export type { FlagDefinition, FlagTier }           from './flags'
