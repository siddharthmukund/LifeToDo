/**
 * src/a11y/index.ts
 * Public barrel export for the Life To Do accessibility system.
 *
 * Import from '@/a11y' (or 'src/a11y') to access any a11y utility.
 */

// Types
export type {
    Politeness,
    AnnouncerMessage,
    FocusTrapOptions,
    MotionPreference,
    KeyboardShortcut,
    TouchTargetResult,
    TouchTargetSeverity,
    WCAGLevel,
    A11yViolationSeverity,
    A11yViolation,
    RouteAnnouncement,
    SkipTarget,
} from './types';

// Config
export { A11Y_CONFIG } from './a11yConfig';
export type { A11yConfig } from './a11yConfig';

// Announcer (singleton + hook)
export { announcer } from './announcer';
export { useAnnounce } from './useAnnounce';
export type { UseAnnounceReturn } from './useAnnounce';

// Focus Management
export { useFocusManagement } from './useFocusManagement';
export { FocusTrap } from './FocusTrap';

// Motion
export {
    useReducedMotion,
    useSystemReducedMotion,
    REDUCED_MOTION_TRANSITION,
    REDUCED_MOTION_VARIANTS,
} from './useReducedMotion';

// Keyboard Navigation
export {
    useKeyboardNavigation,
    getRegisteredShortcuts,
    registerShortcut,
} from './useKeyboardNavigation';

// Touch Target (dev helpers)
export { useTouchTarget, auditTouchTargets, touchTargetRef } from './useTouchTarget';

// Components
export { SkipLink } from './SkipLink';
export { LiveRegion } from './LiveRegion';
