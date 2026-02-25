// analytics/index.ts
// Barrel export — iCCW #4 Enhancement Layer
export { track, pruneOldEvents }                          from './tracker'
export { useTrackAction }                                 from './useTrackAction'
export { computeHealthScore,
         SCORE_COMPONENT_LABELS,
         SCORE_COMPONENT_WEIGHTS }                        from './healthScore'
export { useGTDHealthScore }                              from './useGTDHealthScore'
export type { GTDEventName, EventProps }                  from './events'
export type { HealthScore,
              HealthScoreBreakdown,
              HealthGrade }                               from './healthScore'
