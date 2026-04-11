'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Hash, AtSign, Send, Zap } from 'lucide-react';
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
    const [freeParsed, setFreeParsed] = useState(parseCaptureFree('', []));

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

    const showDueDate = parsedData.dueDate && (!isAiEnabled || suggestions?.confidence.dueDate! >= 0.5);
    const showContext = parsedData.context && (!isAiEnabled || suggestions?.confidence.context! >= 0.5);
    const showProject = parsedData.project && (!isAiEnabled || suggestions?.confidence.project! >= 0.5);
    const showEnergy = parsedData.energyLevel && isAiEnabled && suggestions?.confidence.energyLevel! >= 0.5;

    return (
        <div
            className="relative w-full rounded-2xl border border-[#474754] focus-within:border-[#37f6dd]/50 focus-within:shadow-[0_0_16px_rgba(55,246,221,0.15)] transition-all"
            style={{ background: 'rgba(24,24,38,0.9)' }}
        >
            {/* Parsed tags row */}
            <AnimatePresence>
                {input.length > 0 && (showDueDate || showContext || showProject || showEnergy) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-1 border-b border-white/5"
                    >
                        {showDueDate && (
                            <motion.span layout className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-[#59caff]/10 text-[#59caff] rounded-lg border border-[#59caff]/20">
                                <Calendar size={11} />
                                {format(new Date(parsedData.dueDate!), 'MMM d')}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.dueDate} />}
                            </motion.span>
                        )}
                        {showProject && (
                            <motion.span layout className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-[#c57eff]/10 text-[#c57eff] rounded-lg border border-[#c57eff]/20">
                                <Hash size={11} />
                                {parsedData.project}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.project} />}
                            </motion.span>
                        )}
                        {showContext && (
                            <motion.span layout className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-[#37f6dd]/10 text-[#37f6dd] rounded-lg border border-[#37f6dd]/20">
                                <AtSign size={11} />
                                {parsedData.context}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.context} />}
                            </motion.span>
                        )}
                        {showEnergy && (
                            <motion.span layout className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
                                <Zap size={11} />
                                {parsedData.energyLevel}
                                {isAiEnabled && <AIBadge confidence={suggestions?.confidence.energyLevel} />}
                            </motion.span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main input row */}
            <div className="flex items-center gap-2 px-1">
                <input
                    type="text"
                    value={input}
                    onChange={onInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
                    }}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="flex-1 bg-transparent border-none px-4 py-4 text-base text-[#e9e6f7] placeholder-[#757482] focus:ring-0 focus:outline-none"
                    style={{ caretColor: '#37f6dd' }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!cleanAction.trim() || isSubmitting}
                    aria-label="Send"
                    className="mr-2 p-2.5 bg-[#37f6dd] text-[#0d0d18] rounded-xl font-bold
                               shadow-[0_0_16px_rgba(55,246,221,0.35)] disabled:opacity-30
                               hover:bg-[#11e8cf] transition-all active:scale-90"
                >
                    {isSubmitting ? (
                        <div className="size-5 border-2 border-[#0d0d18]/30 border-t-[#0d0d18] rounded-full animate-spin" />
                    ) : (
                        <Send size={18} strokeWidth={2.5} />
                    )}
                </button>
            </div>

            {/* AI parse hint */}
            <AnimatePresence>
                {(isParsing || (cleanAction.length > 0 && input !== cleanAction)) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute -bottom-5 left-3 flex items-center gap-2 text-[10px] text-[#757482] pointer-events-none"
                    >
                        {isParsing ? <AILoadingIndicator /> : <span>Saving as: &ldquo;{cleanAction}&rdquo;</span>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
