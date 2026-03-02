import { LevelDefinition } from '../types/gamification';

// Level-up formula: xpRequired(level) = Math.floor(50 * level^1.8)
const calculateXPRequired = (level: number) => Math.floor(50 * Math.pow(level, 1.8));

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
    { level: 1, title: 'Inbox Beginner', xpRequired: 0, icon: '🐣' },
    { level: 2, title: 'First Capture', xpRequired: 50, icon: '💡' },
    { level: 3, title: 'Clarify Curious', xpRequired: 150, icon: '🔍' },
    { level: 4, title: 'Two-Minute Doer', xpRequired: 350, icon: '⚡' },
    { level: 5, title: 'Context Switcher', xpRequired: 650, icon: '🏷️' },
    { level: 6, title: 'Inbox Tamer', xpRequired: 1100, icon: '🧹' },
    { level: 7, title: 'Project Planner', xpRequired: 1700, icon: '🏗️' },
    { level: 8, title: 'Review Rookie', xpRequired: 2500, icon: '👀' },
    { level: 9, title: 'Habit Former', xpRequired: 3500, icon: '🌱' },
    { level: 10, title: 'GTD Practitioner', xpRequired: 5000, icon: '🛠️' },
    { level: 11, title: 'Focus Finder', xpRequired: calculateXPRequired(11), icon: '🎯' },
    { level: 12, title: 'Action Oriented', xpRequired: calculateXPRequired(12), icon: '🏃' },
    { level: 13, title: 'Momentum Builder', xpRequired: calculateXPRequired(13), icon: '🚀' },
    { level: 14, title: 'System Trusting', xpRequired: calculateXPRequired(14), icon: '🤝' },
    { level: 15, title: 'Discipline Seeker', xpRequired: calculateXPRequired(15), icon: '⚔️' },
    { level: 16, title: 'Frictionless', xpRequired: calculateXPRequired(16), icon: '🧊' },
    { level: 17, title: 'Flow State', xpRequired: calculateXPRequired(17), icon: '🌊' },
    { level: 18, title: 'Deep Worker', xpRequired: calculateXPRequired(18), icon: '🧠' },
    { level: 19, title: 'Clarity Keeper', xpRequired: calculateXPRequired(19), icon: '✨' },
    { level: 20, title: 'GTD Master', xpRequired: calculateXPRequired(20), icon: '👑' },
    { level: 21, title: 'Zen Organizer', xpRequired: calculateXPRequired(21), icon: '🧘' },
    { level: 22, title: 'Effortless', xpRequired: calculateXPRequired(22), icon: '🕊️' },
    { level: 23, title: 'Unshakable', xpRequired: calculateXPRequired(23), icon: '🏔️' },
    { level: 24, title: 'Fluid Thinker', xpRequired: calculateXPRequired(24), icon: '💧' },
    { level: 25, title: 'Symphony Conductor', xpRequired: calculateXPRequired(25), icon: '🎼' },
    { level: 26, title: 'Time Weaver', xpRequired: calculateXPRequired(26), icon: '⏳' },
    { level: 27, title: 'Mindful Doer', xpRequired: calculateXPRequired(27), icon: '👁️' },
    { level: 28, title: 'Stress Free', xpRequired: calculateXPRequired(28), icon: '🍃' },
    { level: 29, title: 'Clear Space', xpRequired: calculateXPRequired(29), icon: '🌌' },
    { level: 30, title: 'Mind Like Water', xpRequired: 150000, icon: '🌊' },
];
