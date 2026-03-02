'use client'
// ClarifyFlow — the GTD processing decision tree.
// Guides the user through every decision with a full-screen, step-by-step UI.
// Each screen is a single question with 2–3 large answer buttons.
// State flows forward only (no back button — keeps it fast).

import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { TwoMinuteTimer } from './TwoMinuteTimer'
import { Button } from '@/components/ui/Button'
import { useGTDStore } from '@/store/gtdStore'
import { ClarifyAssistant } from '@/components/ai/ClarifyAssistant'
import { useFeatureFlag } from '@/flags/useFeatureFlag'
import { Sparkles } from 'lucide-react'
import type { InboxItem, ClarifyDecision, EnergyLevel, TimeEstimate } from '@/types'

type Step =
  | 'actionable'
  | 'two_min'
  | 'timer'
  | 'delegate'
  | 'single_or_project'
  | 'assign_action'
  | 'create_project'
  | 'non_actionable'
  | 'done'

interface ClarifyFlowProps {
  item: InboxItem
  onComplete: (decision: ClarifyDecision) => void
  onSkip: () => void
}

const CONTEXTS_LABELS: Record<string, string> = {
  'ctx-computer': '💻 @Computer',
  'ctx-office': '🏢 @Office',
  'ctx-home': '🏠 @Home',
  'ctx-errands': '🚗 @Errands',
  'ctx-calls': '📞 @Calls',
  'ctx-anywhere': '🌍 @Anywhere',
}

export function ClarifyFlow({ item, onComplete, onSkip }: ClarifyFlowProps) {
  const [step, setStep] = useState<Step>('actionable')
  const [direction, setDirection] = useState(1) // 1=forward, -1=back

  const contexts = useGTDStore(s => s.contexts)

  // Auto-apply NLP context if it maps to a user defined context
  const initialContextId = item.nlpMetadata?.contexts?.[0]
    ? contexts.find(c => c.name.toLowerCase() === item.nlpMetadata!.contexts[0].toLowerCase())?.id ?? 'ctx-anywhere'
    : 'ctx-anywhere'

  const [contextId, setContextId] = useState(initialContextId)
  const [energy, setEnergy] = useState<EnergyLevel>('medium')
  const [time, setTime] = useState<TimeEstimate>(15)
  // Auto-apply project NLP string as the name
  const [projectName, setProjectName] = useState(item.nlpMetadata?.projects?.[0] ?? '')
  const [nextActionText, setNextActionText] = useState(item.text)
  // Pass the due date parsed into the actual payload directly down
  const dueDateFromNlp = item.nlpMetadata?.dueDate ?? null

  const isAiEnabled = useFeatureFlag('ai_coach')
  const [showCoach, setShowCoach] = useState(false)

  function go(nextStep: Step) {
    setDirection(1)
    setStep(nextStep)
  }

  function emit(decision: Partial<ClarifyDecision>) {
    onComplete({
      contextId,
      energy,
      timeEstimate: time,
      scheduledDate: dueDateFromNlp ? dueDateFromNlp : undefined,
      ...decision,
    } as ClarifyDecision)
  }

  const variants = {
    enter: (d: number) => ({ x: d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: -d * 40, opacity: 0 }),
  }

  return (
    <div className="flex flex-col h-full">
      {/* Item being clarified */}
      <div className="mb-8 px-2 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-ink">Processing Item</p>
          {isAiEnabled && (
            <button
              onClick={() => setShowCoach(true)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors active:scale-95"
            >
              <Sparkles size={12} /> Ask Coach
            </button>
          )}
        </div>
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary">
          <p className="text-lg font-bold text-content-primary leading-tight italic">&ldquo;{item.text}&rdquo;</p>
        </div>
      </div>

      {showCoach && (
        <ClarifyAssistant taskText={item.text} onClose={() => setShowCoach(false)} />
      )}

      {/* Decision steps */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>

          {/* ── ACTIONABLE? ──────────────────────────────────────────────── */}
          {step === 'actionable' && (
            <Step key="actionable" custom={direction} variants={variants}>
              <Question
                q="Is this actionable?"
                sub="Is there something you can physically do to move this forward?"
              />
              <Answers>
                <AnswerBtn label="✅ Yes, I can act on it" onClick={() => go('two_min')} />
                <AnswerBtn label="🗂 No, it's not actionable" onClick={() => go('non_actionable')} variant="secondary" />
              </Answers>
            </Step>
          )}

          {/* ── 2-MINUTE RULE ─────────────────────────────────────────────── */}
          {step === 'two_min' && (
            <Step key="two_min" custom={direction} variants={variants}>
              <Question
                q="Will this take less than 2 minutes?"
                sub="If you can do it faster than filing it, do it now."
              />
              <Answers>
                <AnswerBtn label="⚡ Yes — do it now" onClick={() => go('timer')} />
                <AnswerBtn label="⏳ No, needs more time" onClick={() => go('delegate')} variant="secondary" />
              </Answers>
            </Step>
          )}

          {/* ── 2-MIN TIMER ───────────────────────────────────────────────── */}
          {step === 'timer' && (
            <Step key="timer" custom={direction} variants={variants}>
              <TwoMinuteTimer
                actionText={item.text}
                onDone={() => emit({ destination: 'complete' })}
                onExpire={() => go('delegate')}
              />
            </Step>
          )}

          {/* ── DELEGATE? ─────────────────────────────────────────────────── */}
          {step === 'delegate' && (
            <Step key="delegate" custom={direction} variants={variants}>
              <Question
                q="Can someone else do this?"
                sub="Are you the right person, or are you waiting on someone?"
              />
              <Answers>
                <AnswerBtn
                  label="👤 Yes — delegate / waiting for"
                  onClick={() => emit({ destination: 'waiting_for' })}
                />
                <AnswerBtn
                  label="🙋 No — this is mine"
                  onClick={() => go('single_or_project')}
                  variant="secondary"
                />
              </Answers>
            </Step>
          )}

          {/* ── SINGLE OR PROJECT? ────────────────────────────────────────── */}
          {step === 'single_or_project' && (
            <Step key="single_or_project" custom={direction} variants={variants}>
              <Question
                q="Single action or multi-step project?"
                sub="A project = anything that takes more than one action to complete."
              />
              <Answers>
                <AnswerBtn label="⚡ Single next action" onClick={() => go('assign_action')} />
                <AnswerBtn label="📁 Multi-step project" onClick={() => go('create_project')} variant="secondary" />
              </Answers>
            </Step>
          )}

          {/* ── ASSIGN ACTION ─────────────────────────────────────────────── */}
          {step === 'assign_action' && (
            <Step key="assign_action" custom={direction} variants={variants}>
              <p className="text-lg font-bold text-content-primary mb-4">Organise this action</p>

              {/* Context */}
              <label className="block mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-3 block">Context</span>
                <div className="flex flex-wrap gap-2">
                  {(contexts.length > 0 ? contexts : Object.keys(CONTEXTS_LABELS).map(id => ({ id, name: CONTEXTS_LABELS[id], emoji: '', isDefault: true, sortOrder: 0 }))).map(ctx => (
                    <button
                      key={ctx.id}
                      onClick={() => setContextId(ctx.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 border
                        ${contextId === ctx.id
                          ? 'bg-primary text-content-inverse border-transparent shadow-glow-accent'
                          : 'bg-surface-card text-content-secondary border-border-subtle hover:border-border-default'}`}
                    >
                      {ctx.emoji} {ctx.name}
                    </button>
                  ))}
                </div>
              </label>

              {/* Energy */}
              <label className="block mb-4">
                <span className="text-xs text-content-secondary mb-2 block">Energy required</span>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as EnergyLevel[]).map(e => (
                    <button
                      key={e}
                      onClick={() => setEnergy(e)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all active:scale-95 border-2
                        ${energy === e
                          ? e === 'high' ? 'bg-status-error/10 text-status-error border-status-danger'
                            : e === 'medium' ? 'bg-status-warning/10 text-status-warning border-status-warn'
                              : 'bg-primary/10 text-primary-ink border-primary/30'
                          : 'bg-surface-card text-content-muted border-border-subtle hover:border-border-default'}`}
                    >
                      {e === 'high' ? '⚡' : e === 'medium' ? '🔸' : '🌱'} {e}
                    </button>
                  ))}
                </div>
              </label>

              {/* Time */}
              <label className="block mb-6">
                <span className="text-xs text-content-secondary mb-2 block">Time estimate</span>
                <div className="flex gap-2">
                  {([5, 15, 30, 60, 90] as TimeEstimate[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border
                        ${time === t
                          ? 'bg-primary text-content-inverse border-transparent shadow-glow-accent'
                          : 'bg-surface-card text-content-muted border-border-subtle hover:border-border-default'}`}
                    >
                      {t < 60 ? `${t}m` : `${t / 60}h`}
                    </button>
                  ))}
                </div>
              </label>

              <Button
                fullWidth
                onClick={() => emit({ destination: 'next_action', contextId, energy, timeEstimate: time })}
              >
                Add to Next Actions →
              </Button>
            </Step>
          )}

          {/* ── CREATE PROJECT ─────────────────────────────────────────────── */}
          {step === 'create_project' && (
            <Step key="create_project" custom={direction} variants={variants}>
              <p className="text-xl font-display font-bold text-content-primary mb-2">Name this project</p>
              <p className="text-sm font-medium text-content-secondary mb-6">
                What is the successful outcome you're driving toward?
              </p>
              <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g. Launch redesigned website"
                className="w-full bg-surface-card border border-border-default rounded-2xl
                           px-5 py-4 text-base font-medium text-content-primary placeholder-slate-500
                           focus:outline-none focus:border-primary/50 mb-6 shadow-inner"
                autoFocus
              />
              <p className="text-sm font-medium text-content-secondary mb-2">
                What's the very next physical action?
              </p>
              <input
                value={nextActionText}
                onChange={e => setNextActionText(e.target.value)}
                placeholder="e.g. Draft homepage copy in Notion"
                className="w-full bg-surface-card border border-border-default rounded-2xl
                           px-5 py-4 text-base font-medium text-content-primary placeholder-slate-500
                           focus:outline-none focus:border-primary/50 mb-8 shadow-inner"
              />
              <Button
                fullWidth
                disabled={!projectName.trim() || !nextActionText.trim()}
                onClick={() =>
                  emit({
                    destination: 'project',
                    projectName: projectName.trim(),
                    nextActionText: nextActionText.trim(),
                    contextId,
                    energy,
                    timeEstimate: time,
                  })
                }
              >
                Create Project + Next Action →
              </Button>
            </Step>
          )}

          {/* ── NON-ACTIONABLE ─────────────────────────────────────────────── */}
          {step === 'non_actionable' && (
            <Step key="non_actionable" custom={direction} variants={variants}>
              <Question
                q="What is it?"
                sub="Everything has a home. Choose the right one."
              />
              <Answers>
                <AnswerBtn
                  label="📚 Reference — keep it"
                  onClick={() => emit({ destination: 'reference' })}
                />
                <AnswerBtn
                  label="🌙 Someday / Maybe"
                  onClick={() => emit({ destination: 'someday' })}
                  variant="secondary"
                />
                <AnswerBtn
                  label="🗑 Trash it"
                  onClick={() => emit({ destination: 'trash' })}
                  variant="danger"
                />
              </Answers>
            </Step>
          )}

        </AnimatePresence>
      </div>

      {/* Skip */}
      <button
        onClick={onSkip}
        className="mt-6 mb-4 text-[10px] font-bold uppercase tracking-widest text-content-muted text-center hover:text-content-primary transition-colors"
      >
        Skip this item for now
      </button>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Step({
  children, custom, variants,
}: {
  children: React.ReactNode
  custom: number
  variants: Variants
}) {
  return (
    <motion.div
      custom={custom}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="absolute inset-0 flex flex-col"
    >
      {children}
    </motion.div>
  )
}

function Question({ q, sub }: { q: string; sub: string }) {
  return (
    <div className="mb-8 px-2">
      <h2 className="text-2xl font-display font-bold text-content-primary mb-2 leading-tight">{q}</h2>
      <p className="text-sm font-medium text-content-secondary leading-relaxed">{sub}</p>
    </div>
  )
}

function Answers({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>
}

function AnswerBtn({
  label, onClick, variant = 'primary',
}: {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  const styles = {
    primary: 'bg-primary/10 text-primary-ink border-2 border-primary/30 hover:bg-primary/20 shadow-glow-accent',
    secondary: 'bg-surface-card text-content-primary border-2 border-border-subtle hover:border-border-default',
    danger: 'bg-status-error/10 text-status-error border-2 border-status-danger hover:bg-status-error/20',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-5 rounded-2xl text-base font-bold
                  active:scale-95 transition-all duration-200 ${styles[variant]}`}
    >
      {label}
    </button>
  )
}
