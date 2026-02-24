'use client'
import { useEffect, useState } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import { db } from '@/lib/db'
import type { Action, Project } from '@/types'

export type ProjectWithNextAction = Project & { nextAction: Action | null }

export function useProjects() {
  const { projects, loadProjects, addProject, updateProject, archiveProject } = useGTDStore()
  const [projectsWithActions, setProjectsWithActions] = useState<ProjectWithNextAction[]>([])

  useEffect(() => { loadProjects() }, [loadProjects])

  // Attach the next action to each project for display
  useEffect(() => {
    async function enrich() {
      const enriched = await Promise.all(
        projects.map(async p => {
          const nextAction = p.nextActionId
            ? (await db.actions.get(p.nextActionId)) ?? null
            : null
          return { ...p, nextAction }
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
