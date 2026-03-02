'use client'
// Projects — active project list with next-action status and progress bars.
// Updated in iCCW #3 (Figma: life_to_do_projects_list, project_detail_expansion).
// Shows stuck-project warnings, progress bars (from task counts), and quick-add next action.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, AlertTriangle, ChevronRight, Archive } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useProjects } from '@/hooks/useProjects'
import { useGTDStore } from '@/store/gtdStore'

export default function ProjectsPage() {
  const { projects, projectsWithWarning, addProject, archiveProject } = useProjects()
  const { addAction, updateProject } = useGTDStore()

  const [showNew, setShowNew]             = useState(false)
  const [newName, setNewName]             = useState('')
  const [newOutcome, setNewOutcome]       = useState('')
  const [newNextAction, setNewNextAction] = useState('')
  const [saving, setSaving]               = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    const project = await addProject({
      name:    newName.trim(),
      outcome: newOutcome.trim() || newName.trim(),
      status:  'active',
    })
    if (newNextAction.trim()) {
      const action = await addAction({
        text:         newNextAction.trim(),
        contextId:    'ctx-anywhere',
        energy:       'medium',
        timeEstimate: 15,
        status:       'active',
        projectId:    project.id,
      })
      await updateProject(project.id, { nextActionId: action.id })
    }
    setNewName('')
    setNewOutcome('')
    setNewNextAction('')
    setShowNew(false)
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl border-b border-primary/10 px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-content-primary flex items-center gap-2">
              <FolderOpen size={22} className="text-primary-ink fill-primary/20" />
              Projects
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-1">
              {projects.length} active
              {projectsWithWarning.length > 0 && (
                <span className="text-status-warning ml-2">
                  · {projectsWithWarning.length} stuck
                </span>
              )}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={16} /> New
          </Button>
        </div>
      </div>

      {/* ── Project list ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {projects.map((p, i) => {
            const pct = p.totalActions > 0
              ? Math.round((p.completedActions / p.totalActions) * 100)
              : 0

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-2xl px-5 py-5 border-l-4 transition-all
                  ${!p.nextAction ? 'border-l-yellow-500' : 'border-l-primary'}`}
              >
                {/* Stuck badge */}
                {!p.nextAction && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                                  text-status-warning mb-3 bg-status-warning/10 w-fit px-2.5 py-1 rounded-lg border border-status-warn">
                    <AlertTriangle size={12} />
                    No next action
                  </div>
                )}

                {/* Name */}
                <p className="font-bold text-content-primary text-base leading-tight mb-1">{p.name}</p>

                {/* Outcome */}
                {p.outcome && p.outcome !== p.name && (
                  <p className="text-sm font-medium text-content-secondary mb-2 italic leading-snug">{p.outcome}</p>
                )}

                {/* Progress bar — only shown when tasks exist */}
                {p.totalActions > 0 && (
                  <div className="mt-3 mb-1">
                    <ProgressBar
                      value={p.completedActions}
                      max={p.totalActions}
                      label={`${p.completedActions} / ${p.totalActions} tasks · ${pct}%`}
                      showLabel
                      size="sm"
                      color={pct >= 100 ? 'success' : pct >= 50 ? 'accent' : 'warning'}
                    />
                  </div>
                )}

                {/* Next action */}
                {p.nextAction ? (
                  <div className="flex items-center gap-3 mt-4 px-4 py-3
                                  bg-surface-card rounded-xl border border-border-subtle shadow-inner">
                    <ChevronRight size={16} className="text-primary-ink flex-shrink-0" />
                    <p className="text-sm font-medium text-content-primary truncate">{p.nextAction.text}</p>
                  </div>
                ) : (
                  <button
                    className="mt-3 text-sm font-bold text-primary-ink hover:underline hover:text-primary-ink/80 transition-colors"
                    onClick={async () => {
                      const text = prompt('What is the very next physical action?')
                      if (!text?.trim()) return
                      const action = await addAction({
                        text:         text.trim(),
                        contextId:    'ctx-anywhere',
                        energy:       'medium',
                        timeEstimate: 15,
                        status:       'active',
                        projectId:    p.id,
                      })
                      await updateProject(p.id, { nextActionId: action.id })
                    }}
                  >
                    + Add next action
                  </button>
                )}

                {/* Archive */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => archiveProject(p.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                               text-content-muted hover:text-status-error transition-colors"
                  >
                    <Archive size={14} /> Archive
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="pt-8">
            <EmptyState
              icon="📁"
              title="No active projects"
              description="A project is any goal requiring more than one action. Create one to track your outcomes."
              action={
                <Button size="sm" onClick={() => setShowNew(true)}>
                  Create first project
                </Button>
              }
            />
          </div>
        )}
      </div>

      {/* ── New project modal ──────────────────────────────────────────────── */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Project">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              Project name *
            </label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Launch new website"
              className="w-full bg-surface-card border border-border-default rounded-2xl px-5 py-4
                         text-base font-medium text-content-primary placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              Desired outcome
            </label>
            <input
              value={newOutcome}
              onChange={e => setNewOutcome(e.target.value)}
              placeholder="What does 'done' look like?"
              className="w-full bg-surface-card border border-border-default rounded-2xl px-5 py-4
                         text-base font-medium text-content-primary placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              First next action *
            </label>
            <input
              value={newNextAction}
              onChange={e => setNewNextAction(e.target.value)}
              placeholder="What's the very first physical action?"
              className="w-full bg-surface-card border border-border-default rounded-2xl px-5 py-4
                         text-base font-medium text-content-primary placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
            />
          </div>
          <Button
            fullWidth
            size="lg"
            disabled={!newName.trim() || !newNextAction.trim()}
            loading={saving}
            onClick={handleCreate}
          >
            Create Project
          </Button>
        </div>
      </Modal>
    </div>
  )
}
