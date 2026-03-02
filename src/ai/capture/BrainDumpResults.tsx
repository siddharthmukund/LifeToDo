import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, AtSign, Hash, Zap } from 'lucide-react';
import { BrainDumpTask } from '../schemas/brainDumpResult';
import { format } from 'date-fns';

interface BrainDumpResultsProps {
    tasks: BrainDumpTask[];
    onAdd: (selectedTasks: BrainDumpTask[]) => void;
    onCancel: () => void;
    isADHDMode?: boolean;
}

export function BrainDumpResults({ tasks, onAdd, onCancel, isADHDMode = false }: BrainDumpResultsProps) {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
        new Set(tasks.map((_, i) => i)) // Check all by default
    );

    // ADHD Mode: limit to top 5 initial tasks
    const [showAll, setShowAll] = useState(!isADHDMode);

    const visibleTasks = showAll ? tasks : tasks.slice(0, 5);
    const hiddenCount = tasks.length - visibleTasks.length;

    const toggleSelection = (idx: number) => {
        const next = new Set(selectedIndices);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setSelectedIndices(next);
    };

    const handleConfirm = () => {
        const selected = tasks.filter((_, i) => selectedIndices.has(i));
        if (selected.length > 0) onAdd(selected);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-baseline shrink-0">
                <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                    Extracted {tasks.length} tasks
                </h3>
                <span className="text-sm text-zinc-500 font-medium">
                    {selectedIndices.size} selected
                </span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1 space-y-2">
                <AnimatePresence mode="popLayout">
                    {visibleTasks.map((task, idx) => {
                        const isSelected = selectedIndices.has(idx);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={`bd-task-${idx}`}
                                onClick={() => toggleSelection(idx)}
                                className={`
                                    p-4 rounded-xl border cursor-pointer transition-all flex gap-3 group
                                    ${isSelected
                                        ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm'
                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-70 hover:opacity-100'}
                                `}
                            >
                                <div className={`
                                    mt-0.5 shrink-0 size-5 rounded-md border flex items-center justify-center transition-colors
                                    ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}
                                `}>
                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-[15px] mb-1.5 transition-colors ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {task.title}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 pointer-events-none">
                                        {task.dueDate && (
                                            <span className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-blue-100/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                <Calendar size={10} /> {format(new Date(task.dueDate), 'MMM d')}
                                            </span>
                                        )}
                                        {task.context && (
                                            <span className="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                <AtSign size={10} /> {task.context.replace('@', '')}
                                            </span>
                                        )}
                                        {task.project && (
                                            <span className="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded bg-orange-100/50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                                                <Hash size={10} /> {task.project}
                                            </span>
                                        )}
                                        {task.energyLevel && (
                                            <span className="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded bg-yellow-100/50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400">
                                                <Zap size={10} className={task.energyLevel === 'high' ? 'fill-current' : ''} />
                                                <span className="capitalize">{task.energyLevel}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {hiddenCount > 0 && !showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="w-full py-2.5 text-sm font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                        Show {hiddenCount} more tasks
                    </button>
                )}
            </div>

            <div className="flex gap-3 pt-3 mt-auto shrink-0 border-t border-border-default">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 text-zinc-600 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={selectedIndices.size === 0}
                    className="flex-[2] py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors"
                >
                    Add {selectedIndices.size} Items to Inbox
                </button>
            </div>
        </div>
    );
}
