// src/components/onboarding/rolePresets.ts
// Role-based default data applied during onboarding personalisation.

import type { UserRole, WorkingHours, ReviewScheduleConfig } from '@/types'

export interface RolePreset {
  role: UserRole
  label: string
  emoji: string
  tagline: string
  contexts: Array<{ name: string; emoji: string }>
  sampleProject: { name: string; outcome: string; tasks: string[] } | null
  workingHours: WorkingHours
  reviewSchedule: ReviewScheduleConfig
}

export const ROLE_PRESETS: Record<UserRole, RolePreset> = {
  professional: {
    role:    'professional',
    label:   'Professional',
    emoji:   '💼',
    tagline: 'Managing projects, meetings, and deadlines',
    contexts: [
      { name: '@office',    emoji: '🏢' },
      { name: '@home',      emoji: '🏠' },
      { name: '@computer',  emoji: '💻' },
      { name: '@calls',     emoji: '📞' },
      { name: '@meetings',  emoji: '📅' },
    ],
    sampleProject: {
      name:    'Q2 Planning',
      outcome: 'Deliver Q2 roadmap with team buy-in by end of month',
      tasks: [
        'Draft Q2 objectives and key results',
        'Schedule roadmap review with stakeholders',
        'Identify resource gaps and dependencies',
      ],
    },
    workingHours: {
      enabled:   true,
      days:      [1, 2, 3, 4, 5],  // Mon–Fri
      startTime: '09:00',
      endTime:   '18:00',
    },
    reviewSchedule: {
      dayOfWeek:              0,  // Sunday
      timeOfDay:             '18:00',
      reminderMinutesBefore: 30,
    },
  },

  freelancer: {
    role:    'freelancer',
    label:   'Freelancer',
    emoji:   '🚀',
    tagline: 'Juggling clients, projects, and admin',
    contexts: [
      { name: '@client-A', emoji: '🤝' },
      { name: '@client-B', emoji: '🤝' },
      { name: '@admin',    emoji: '📋' },
      { name: '@computer', emoji: '💻' },
      { name: '@errands',  emoji: '🛒' },
    ],
    sampleProject: {
      name:    'Client Onboarding Template',
      outcome: 'Smooth, repeatable onboarding process for every new client',
      tasks: [
        'Send welcome package and contract',
        'Schedule kickoff call and set expectations',
        'Create shared project workspace',
      ],
    },
    workingHours: {
      enabled:   true,
      days:      [1, 2, 3, 4, 5, 6],  // Mon–Sat
      startTime: '10:00',
      endTime:   '20:00',
    },
    reviewSchedule: {
      dayOfWeek:              5,  // Friday
      timeOfDay:             '17:00',
      reminderMinutesBefore: 30,
    },
  },

  student: {
    role:    'student',
    label:   'Student',
    emoji:   '🎓',
    tagline: 'Balancing classes, assignments, and life',
    contexts: [
      { name: '@campus',     emoji: '🏫' },
      { name: '@library',    emoji: '📚' },
      { name: '@home',       emoji: '🏠' },
      { name: '@computer',   emoji: '💻' },
      { name: '@group-work', emoji: '👥' },
    ],
    sampleProject: {
      name:    'Semester Setup',
      outcome: 'Start the semester organised with all deadlines tracked',
      tasks: [
        'Add all assignment due dates to the app',
        'Set up a study context for each subject',
        'Schedule weekly review on Sunday evenings',
      ],
    },
    workingHours: {
      enabled:   true,
      days:      [1, 2, 3, 4, 5],  // Mon–Fri
      startTime: '08:00',
      endTime:   '16:00',
    },
    reviewSchedule: {
      dayOfWeek:              0,  // Sunday
      timeOfDay:             '20:00',
      reminderMinutesBefore: 15,
    },
  },

  custom: {
    role:    'custom',
    label:   'Custom',
    emoji:   '✨',
    tagline: 'Build your own GTD system from scratch',
    contexts: [],
    sampleProject: null,
    workingHours: {
      enabled:   false,
      days:      [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime:   '18:00',
    },
    reviewSchedule: {
      dayOfWeek:              0,
      timeOfDay:             '18:00',
      reminderMinutesBefore: 30,
    },
  },
}

export const ROLE_OPTIONS: RolePreset[] = [
  ROLE_PRESETS.professional,
  ROLE_PRESETS.freelancer,
  ROLE_PRESETS.student,
  ROLE_PRESETS.custom,
]
