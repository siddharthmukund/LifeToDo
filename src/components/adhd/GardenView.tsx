'use client'

import React from 'react'
import { useGTDStore } from '@/store/gtdStore'
import { useADHDMode } from '@/hooks/useADHDMode'
import { GardenPlant } from './GardenPlant'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function GardenView() {
  const { isADHDMode } = useADHDMode()
  const { actions } = useGTDStore()
  const t = useTranslations(isADHDMode ? 'adhd' : 'common')
  
  if (!isADHDMode) return null
  
  // Very naive example: derive plant states from total count of tasks completed or active.
  const completedCount = actions.filter(a => a.status === 'complete').length
  const plants = Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    stage: completedCount > i * 5 ? 'blooming' : completedCount > i * 2 ? 'growing' : 'resting'
  }))

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface-card rounded-3xl overflow-hidden glass-card">
        <h3 className="font-bold text-center mb-4 tracking-widest uppercase text-xs text-content-secondary">
          {t('garden_status') || 'Your Garden'}
        </h3>
        
        <div className="flex items-end justify-center gap-4 h-32 border-b-2 border-border-default/20 pb-2 w-full">
            {plants.map(p => (
                <motion.div 
                   key={p.id} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: p.id * 0.1 }}
                >
                    <GardenPlant stage={p.stage as 'blooming' | 'growing' | 'resting'} />
                </motion.div>
            ))}
        </div>
    </div>
  )
}
