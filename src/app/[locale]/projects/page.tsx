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
import { useTranslations } from 'next-intl'

export default function ProjectsPage() {
  const t = useTranslations('projects')
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
      <div className="sticky top-0 z-10 glass-header px-6 pt-4 pb-4">
        {/* App bar */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#37f6dd]">
            Projects
          </h1>
          <button
            onClick={() => setShowNew(true)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#37f6dd] to-[#00e5cc] text-[#0d0d18] flex items-center justify-center shadow-[0_0_16px_rgba(55,246,221,0.35)] hover:opacity-90 transition-all active:scale-90"
            aria-label={t('newButton')}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
        {/* Editorial velocity stat */}
        <div className="mb-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aba9b9] mb-1">
            Current Velocity
          </p>
          <div className="flex items-end gap-3">
            <span className="text-[3.5rem] font-extrabold tracking-tighter leading-none text-[#e9e6f7]">
              {projects.length}
            </span>
            <div className="pb-2">
              <span className="text-[#37f6dd] font-bold text-sm">{t('active')}</span>
              {projectsWithWarning.length > 0 && (
                <p className="text-[10px] text-yellow-400 font-bold">
                  {projectsWithWarning.length} {t('stuck')}
                </p>
              )}
            </div>
          </div>
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
                className={`glass-card rounded-2xl px-5 py-5 border-l-4 transition-all cursor-pointer group
                  hover:bg-[#1e1e2d] active:scale-[0.98]
                  ${!p.nextAction ? 'border-l-yellow-500' : 'border-l-[#37f6dd]'}`}
              >
                {/* Stuck badge */}
                {!p.nextAction && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                                  text-status-warning mb-3 bg-status-warning/10 w-fit px-2.5 py-1 rounded-lg border border-status-warn">
                    <AlertTriangle size={12} />
                    {t('noNextAction')}
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
                      label={`${p.completedActions} / ${p.totalActions} ${t('tasks')} · ${pct}%`}
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
                      const text = prompt(t('promptNextAction'))
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
                    {t('addNextAction')}
                  </button>
                )}

                {/* Archive */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => archiveProject(p.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                               text-content-muted hover:text-status-error transition-colors"
                  >
                    <Archive size={14} /> {t('archive')}
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
              title={t('emptyState.title')}
              description={t('emptyState.description')}
              action={
                <Button size="sm" onClick={() => setShowNew(true)}>
                  {t('emptyState.action')}
                </Button>
              }
            />
          </div>
        )}
      </div>

      {/* ── New project modal ──────────────────────────────────────────────── */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={t('create')}>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              {t('form.nameLabel')}
            </label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
              className="w-full bg-surface-card border border-border-default rounded-2xl px-5 py-4
                         text-base font-medium text-content-primary placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              {t('form.outcomeLabel')}
            </label>
            <input
              value={newOutcome}
              onChange={e => setNewOutcome(e.target.value)}
              placeholder={t('form.outcomePlaceholder')}
              className="w-full bg-surface-card border border-border-default rounded-2xl px-5 py-4
                         text-base font-medium text-content-primary placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
              {t('form.nextActionLabel')}
            </label>
            <input
              value={newNextAction}
              onChange={e => setNewNextAction(e.target.value)}
              placeholder={t('form.nextActionPlaceholder')}
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
            {t('form.createButton')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
