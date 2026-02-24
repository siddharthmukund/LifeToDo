'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, AlertTriangle, ChevronRight, Archive } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProjects } from '@/hooks/useProjects'
import { useGTDStore } from '@/store/gtdStore'

export default function ProjectsPage() {
  const { projects, projectsWithWarning, addProject, archiveProject } = useProjects()
  const { addAction, updateProject } = useGTDStore()

  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newOutcome, setNewOutcome] = useState('')
  const [newNextAction, setNewNextAction] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    const project = await addProject({
      name: newName.trim(),
      outcome: newOutcome.trim() || newName.trim(),
      status: 'active',
    })
    if (newNextAction.trim()) {
      const action = await addAction({
        text: newNextAction.trim(),
        contextId: 'ctx-anywhere',
        energy: 'medium',
        timeEstimate: 15,
        status: 'active',
        projectId: project.id,
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-xl border-b border-primary/10 px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <FolderOpen size={22} className="text-primary fill-primary/20" />
              Projects
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
              {projects.length} active
              {projectsWithWarning.length > 0 && (
                <span className="text-yellow-500 ml-2">
                  · {projectsWithWarning.length} need attention
                </span>
              )}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={16} /> New
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card rounded-2xl px-5 py-5 border-l-4 transition-all
                ${!p.nextAction
                  ? 'border-l-yellow-500'
                  : 'border-l-primary'}`}
            >
              {/* Warning stripe */}
              {!p.nextAction && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-yellow-500 mb-3 bg-yellow-500/10 w-fit px-2 py-1 rounded">
                  <AlertTriangle size={12} />
                  No next action
                </div>
              )}

              <p className="font-bold text-white text-base mb-1">{p.name}</p>
              {p.outcome && p.outcome !== p.name && (
                <p className="text-sm font-medium text-slate-400 mb-3 italic">{p.outcome}</p>
              )}

              {/* Next action */}
              {p.nextAction ? (
                <div className="flex items-center gap-3 mt-4 px-4 py-3
                                bg-card-dark rounded-xl border border-white/5 shadow-inner">
                  <ChevronRight size={16} className="text-primary flex-shrink-0" />
                  <p className="text-sm font-medium text-slate-300 truncate">{p.nextAction.text}</p>
                </div>
              ) : (
                <button
                  className="mt-3 text-sm font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
                  onClick={async () => {
                    const text = prompt('What is the very next physical action?')
                    if (!text?.trim()) return
                    const action = await addAction({
                      text: text.trim(),
                      contextId: 'ctx-anywhere',
                      energy: 'medium',
                      timeEstimate: 15,
                      status: 'active',
                      projectId: p.id,
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
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors"
                >
                  <Archive size={14} /> Archive
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="pt-8">
            <EmptyState
              icon="📁"
              title="No active projects"
              description="A project is any goal that takes more than one action. Create one to track your outcomes."
              action={<Button size="sm" onClick={() => setShowNew(true)}>Create first project</Button>}
            />
          </div>
        )}
      </div>

      {/* New project modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Project">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Project name *</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Launch new website"
              className="w-full bg-card-dark border border-white/10 rounded-2xl px-5 py-4
                         text-base font-medium text-white placeholder-slate-500 focus:outline-none
                         focus:border-primary/50 shadow-inner"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Desired outcome</label>
            <input
              value={newOutcome}
              onChange={e => setNewOutcome(e.target.value)}
              placeholder="What does 'done' look like?"
              className="w-full bg-card-dark border border-white/10 rounded-2xl px-5 py-4
                         text-base font-medium text-white placeholder-slate-500 focus:outline-none
                         focus:border-primary/50 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">First next action *</label>
            <input
              value={newNextAction}
              onChange={e => setNewNextAction(e.target.value)}
              placeholder="What's the very first physical action?"
              className="w-full bg-card-dark border border-white/10 rounded-2xl px-5 py-4
                         text-base font-medium text-white placeholder-slate-500 focus:outline-none
                         focus:border-primary/50 shadow-inner"
            />
          </div>
          <Button
            fullWidth
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
