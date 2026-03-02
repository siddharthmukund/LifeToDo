// src/hooks/useOnboardingPersonalization.ts
// Applies a role preset to the local GTD data at the end of onboarding.
'use client'

import { useGTDStore } from '@/store/gtdStore'
import { db } from '@/lib/db'
import { ROLE_PRESETS } from '@/components/onboarding/rolePresets'
import type { UserRole } from '@/types'

export function useOnboardingPersonalization() {
  const { updateSettings, addContext } = useGTDStore()

  async function applyRolePreset(role: UserRole): Promise<void> {
    const preset = ROLE_PRESETS[role]
    if (!preset) return

    // 1. Update review schedule + working hours in settings
    await updateSettings({
      reviewDay:  preset.reviewSchedule.dayOfWeek,
      reviewTime: preset.reviewSchedule.timeOfDay,
    })

    // 2. Add preset contexts (idempotent — check by name first)
    const existingContexts = await db.contexts.toArray()
    const existingNames = new Set(existingContexts.map(c => c.name.toLowerCase()))

    for (const ctx of preset.contexts) {
      if (!existingNames.has(ctx.name.toLowerCase())) {
        await addContext(ctx.name)
      }
    }

    // 3. Add sample project if preset provides one
    if (preset.sampleProject) {
      const { addProject, addAction } = useGTDStore.getState()
      const project = await addProject({
        name:    preset.sampleProject.name,
        outcome: preset.sampleProject.outcome,
        status:  'active',
      })
      if (project?.id) {
        // Default context fallback — use first preset context or '@computer'
        const defaultCtxName = preset.contexts[0]?.name ?? '@computer'
        const allContexts = await db.contexts.toArray()
        const ctxRecord = allContexts.find(c => c.name === defaultCtxName)
        const ctxId = ctxRecord?.id ?? allContexts[0]?.id ?? 'none'

        for (const taskText of preset.sampleProject.tasks) {
          await addAction({
            text:         taskText,
            projectId:    project.id,
            contextId:    ctxId,
            energy:       'medium',
            timeEstimate: 30,
            status:       'active',
          })
        }
      }
    }
  }

  return { applyRolePreset }
}
