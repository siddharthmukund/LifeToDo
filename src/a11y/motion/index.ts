/**
 * src/a11y/motion/index.ts
 * Barrel export for the reduced-motion utilities.
 */

export {
    SPRING,
    SPRING_SLOW,
    SPRING_FAST,
    FADE,
    EASE,
    INSTANT,
    SLIDE_UP_VARIANTS,
    FADE_VARIANTS,
    STATIC_VARIANTS,
    ANIMATION_MAP,
} from './motionConfig';
export type { AnimationName } from './motionConfig';

export { SafeAnimation } from './SafeAnimation';
