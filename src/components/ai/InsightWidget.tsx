'use client';

import { useCoachInsights } from '@/hooks/ai/useCoachInsights';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useFeatureFlag } from '@/flags/useFeatureFlag';

export function InsightWidget() {
    const { insights, isAnalyzing } = useCoachInsights();
    const isAiEnabled = useFeatureFlag('ai_coach'); // AI Layer Toggle Check

    if (!isAiEnabled) return null;

    return (
        <AnimatePresence>
            {insights.length > 0 && !isAnalyzing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm"
                >
                    <div className="flex-shrink-0 size-12 rounded-full bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <BrainCircuit size={24} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-100">Coach Insight</h3>
                            {insights[0].priority > 75 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-full">
                                    <AlertCircle size={10} /> Action Needed
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-indigo-700/80 dark:text-indigo-300">
                            {insights[0].description}
                        </p>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        <Link
                            href={insights[0].actionRoute}
                            className="inline-flex w-full md:w-auto justify-center items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/20 active:scale-95"
                        >
                            {insights[0].actionLabel}
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
