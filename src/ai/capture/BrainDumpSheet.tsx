'use client';
import { useState, useRef } from 'react';
import { X, Brain, Plus, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBrainDump } from './useBrainDump';
import type { AIContext } from '../types';
import type { BrainDumpTask } from '../schemas/brainDumpResult';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: BrainDumpTask[]) => void;
  aiContext: AIContext;
  isADHDMode?: boolean;
}

export function BrainDumpSheet({ isOpen, onClose, onAddTasks, aiContext, isADHDMode = false }: Props) {
  const [text, setText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { phase, tasks, selectedIndices, selectedTasks, error, process, toggleTask, reset } = useBrainDump(aiContext);

  const INITIAL_SHOW = isADHDMode ? 5 : tasks.length;
  const visibleTasks = showAll ? tasks : tasks.slice(0, INITIAL_SHOW);

  function handleAdd() {
    onAddTasks(selectedTasks);
    reset();
    setText('');
    onClose();
  }

  function handleReset() {
    reset();
    setText('');
    setTimeout(() => textRef.current?.focus(), 100);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-surface-base rounded-t-2xl max-h-[85vh] flex flex-col"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-semibold text-content-primary">Brain Dump</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-card">
                <X className="w-4 h-4 text-content-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Input phase */}
              {(phase === 'idle' || phase === 'error') && (
                <div className="space-y-3">
                  <p className="text-sm text-content-secondary">
                    Paste or type everything on your mind. AI will extract individual tasks.
                  </p>
                  <textarea
                    ref={textRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="I need to call the dentist, finish the report by Thursday, buy groceries, fix the leaky faucet…"
                    className="w-full h-36 px-3 py-2 bg-surface-card border border-border-default rounded-xl text-sm text-content-primary placeholder:text-content-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    autoFocus
                  />
                  {error && <p className="text-sm text-status-danger">{error}</p>}
                  <button
                    onClick={() => process(text)}
                    disabled={text.trim().length < 10}
                    className="w-full py-2.5 bg-primary text-white rounded-xl font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Process with AI
                  </button>
                </div>
              )}

              {/* Processing */}
              {phase === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Brain className="w-8 h-8 text-primary animate-pulse" />
                  <p className="text-sm text-content-secondary">Extracting tasks from your brain dump…</p>
                </div>
              )}

              {/* Results */}
              {phase === 'results' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-content-primary">
                      Found {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </p>
                    <button onClick={handleReset} className="flex items-center gap-1 text-xs text-content-muted hover:text-content-secondary">
                      <RotateCcw className="w-3 h-3" /> Start over
                    </button>
                  </div>

                  <div className="space-y-2">
                    {visibleTasks.map((task, i) => (
                      <label key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-card cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIndices.has(i)}
                          onChange={() => toggleTask(i)}
                          className="mt-0.5 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-content-primary">{task.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.context && <span className="text-[10px] bg-surface-card border border-border-subtle px-1.5 py-0.5 rounded-full text-content-muted">{task.context}</span>}
                            {task.project && <span className="text-[10px] bg-surface-card border border-border-subtle px-1.5 py-0.5 rounded-full text-content-muted">📁 {task.project}</span>}
                            {task.energyLevel && <span className="text-[10px] bg-surface-card border border-border-subtle px-1.5 py-0.5 rounded-full text-content-muted">⚡ {task.energyLevel}</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {isADHDMode && !showAll && tasks.length > INITIAL_SHOW && (
                    <button onClick={() => setShowAll(true)} className="text-xs text-primary underline">
                      Show {tasks.length - INITIAL_SHOW} more…
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {phase === 'results' && (
              <div className="p-4 border-t border-border-subtle">
                <button
                  onClick={handleAdd}
                  disabled={selectedTasks.length === 0}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add {selectedTasks.length} item{selectedTasks.length !== 1 ? 's' : ''} to inbox
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
