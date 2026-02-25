// Custom hooks — barrel export
// New in iCCW #3 (Figma-to-Code pass): useADHDMode, usePagination, useGTDContextFilter, useOfflineSync
// New in iCCW #4 (Enhancement Layer): useGTDHealthScore, useTrackAction
export { useActions }          from './useActions'
export { useADHDMode }         from './useADHDMode'
export { useEnergy }           from './useEnergy'
export { useGTDContextFilter } from './useGTDContextFilter'
export { useInbox }            from './useInbox'
export { useOfflineSync }      from './useOfflineSync'
export { usePagination }       from './usePagination'
export { useProjects }         from './useProjects'
export { useStaleItems }       from './useStaleItems'
export { useVoiceCapture }     from './useVoiceCapture'
export { useWeeklyReview }     from './useWeeklyReview'
export { useGTDHealthScore }   from '@/analytics/useGTDHealthScore'
export { useTrackAction }      from '@/analytics/useTrackAction'
