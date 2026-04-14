'use client'

import { useCoachInsights } from '@/hooks/ai/useCoachInsights'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useFeatureFlag } from '@/flags/useFeatureFlag'

export function InsightWidget() {
  const { insights, isAnalyzing } = useCoachInsights()
  const isAiEnabled = useFeatureFlag('ai_coach')

  if (!isAiEnabled) return null

  return (
    <AnimatePresence>
      {insights.length > 0 && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full glass-card rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center border-l-4 border-l-primary"
        >
          <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 text-primary-ink flex items-center justify-center">
            <BrainCircuit size={24} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-content-primary">Coach Insight</h3>
              {insights[0].priority > 75 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} /> Action Needed
                </span>
              )}
            </div>
            <p className="text-sm text-content-secondary">
              {insights[0].description}
            </p>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
            <Link
              href={insights[0].actionRoute}
              className="inline-flex w-full md:w-auto justify-center items-center gap-2 px-6 py-2.5 bg-primary text-on-brand text-sm font-bold rounded-xl transition-all shadow-glow-accent hover:bg-primary/90 active:scale-95"
            >
              {insights[0].actionLabel}
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
