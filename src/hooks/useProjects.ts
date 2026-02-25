'use client'
// useProjects — enriches projects with their next action + task counts.
// Updated in iCCW #3: added totalActions / completedActions for Figma progress bars.

import { useEffect, useState } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import { db } from '@/lib/db'
import type { Action, Project } from '@/types'

export type ProjectWithNextAction = Project & {
  nextAction: Action | null
  totalActions: number
  completedActions: number
}

export function useProjects() {
  const { projects, loadProjects, addProject, updateProject, archiveProject } = useGTDStore()
  const [projectsWithActions, setProjectsWithActions] = useState<ProjectWithNextAction[]>([])

  useEffect(() => { loadProjects() }, [loadProjects])

  // Attach next action + task counts to each project for display
  useEffect(() => {
    async function enrich() {
      const enriched = await Promise.all(
        projects.map(async p => {
          const nextAction = p.nextActionId
            ? (await db.actions.get(p.nextActionId)) ?? null
            : null

          // Count all actions for this project (complete + active)
          const allProjectActions = await db.actions
            .where('projectId')
            .equals(p.id)
            .toArray()

          const totalActions     = allProjectActions.length
          const completedActions = allProjectActions.filter(a => a.status === 'complete').length

          return { ...p, nextAction, totalActions, completedActions }
        })
      )
      setProjectsWithActions(enriched)
    }
    enrich()
  }, [projects])

  const projectsWithWarning = projectsWithActions.filter(p => !p.nextAction)
  const projectsHealthy     = projectsWithActions.filter(p =>  p.nextAction)

  return {
    projects: projectsWithActions,
    projectsWithWarning,
    projectsHealthy,
    addProject,
    updateProject,
    archiveProject,
    refresh: loadProjects,
  }
}
