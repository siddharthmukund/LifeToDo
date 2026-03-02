'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Hash, AtSign, Send, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import { useSmartCapture, parseCaptureFree } from '@/ai/capture';
import { useFeatureFlag } from '@/flags/useFeatureFlag';
import { AILoadingIndicator } from './AILoadingIndicator';
import { AIBadge } from './AIBadge';

interface SmartInputBarProps {
    onCapture: (cleanText: string, metadata: { dueDate: Date | null, projects: string[], contexts: string[], energyLevel: string | null }) => Promise<void>;
    placeholder?: string;
    autoFocus?: boolean;
}

export function SmartInputBar({ onCapture, placeholder = "Capture a thought...", autoFocus = false }: SmartInputBarProps) {
    const isAiEnabled = useFeatureFlag('ai_coach');
    const { parse: handleInput, loading: isParsing, result: suggestions, clear: clearSuggestions } = useSmartCapture({ existingContexts: [], existingProjects: [] });

    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fallback UI State
    const [freeParsed, setFreeParsed] = useState(parseCaptureFree('', []));

    // Handle user typing
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);

        if (isAiEnabled) {
            handleInput(val);
        } else {
            setFreeParsed(parseCaptureFree(val, []));
        }
    };

    const parsedData = isAiEnabled && suggestions ? suggestions : freeParsed;
    // Free parser sets 'title', AI schemas also set 'title'
    const cleanAction = parsedData.title || input;

    const handleSubmit = async () => {
        if (!cleanAction.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onCapture(cleanAction, {
                dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
                projects: parsedData.project ? [parsedData.project] : [],
                contexts: parsedData.context ? [parsedData.context] : [],
                energyLevel: parsedData.energyLevel || null
            });
            setInput('');
            if (isAiEnabled) clearSuggestions();
            else setFreeParsed(parseCaptureFree('', []));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter AI Suggestions by confidence threshold (>= 0.5)
    const showDueDate = parsedData.dueDate && (!isAiEnabled || suggestions?.confidence.dueDate! >= 0.5);
    const showContext = parsedData.context && (!isAiEnabled || suggestions?.confidence.context! >= 0.5);
    const showProject = parsedData.project && (!isAiEnabled || suggestions?.confidence.project! >= 0.5);
    const showEnergy = parsedData.energyLevel && isAiEnabled && suggestions?.confidence.energyLevel! >= 0.5;

    return (
        <div className="relative w-full rounded-2xl border border-blue-500/30 bg-white dark:bg-zinc-900 shadow-lg shadow-blue-500/5 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">

            <AnimatePresence>
                {input.length > 0 && (showDueDate || showContext || showProject || showEnergy) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-1 border-b border-border-default/50"
                    >
                        {showDueDate && (
                            <motion.button type="button" layout className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-md ring-1 ring-indigo-500/30">
                                <Calendar size={12} />
                                {format(new Date(parsedData.dueDate!), 'MMM d, h:mm a')}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.dueDate} />}
                            </motion.button>
                        )}
                        {showProject && (
                            <motion.button type="button" layout className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 rounded-md ring-1 ring-orange-500/30">
                                <Hash size={12} opacity={0.6} />
                                {parsedData.project}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.project} />}
                            </motion.button>
                        )}
                        {showContext && (
                            <motion.button type="button" layout className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-md ring-1 ring-emerald-500/30">
                                <AtSign size={12} opacity={0.6} />
                                {parsedData.context}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.context} />}
                            </motion.button>
                        )}
                        {showEnergy && (
                            <motion.button type="button" layout className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 rounded-md ring-1 ring-yellow-500/30">
                                <Zap size={12} opacity={0.6} />
                                {parsedData.energyLevel}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.energyLevel} />}
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={onInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="flex-1 bg-transparent border-none px-4 py-3.5 text-base focus:ring-0 focus:outline-none dark:text-white"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!cleanAction.trim() || isSubmitting}
                    className="p-3 bg-blue-500 mr-1.5 text-white rounded-xl shadow focus:outline-none hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send size={18} />
                    )}
                </button>
            </div>

            <AnimatePresence>
                {(isParsing || (cleanAction.length > 0 && input !== cleanAction)) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute -bottom-6 left-2 flex items-center gap-2 text-[10px] text-zinc-400 font-mono pointer-events-none"
                    >
                        {isParsing ? (
                            <AILoadingIndicator />
                        ) : (
                            <span>Saving as: "{cleanAction}"</span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

