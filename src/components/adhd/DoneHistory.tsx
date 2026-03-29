'use client'

import React from 'react'
import { useGTDStore } from '@/store/gtdStore'
import { useADHDMode } from '@/hooks/useADHDMode'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ActionCard } from '@/components/today/ActionCard'

export function DoneHistory() {
    const { isADHDMode } = useADHDMode()
    const { actions } = useGTDStore()
    
    if (!isADHDMode) return null
    
    // Naively filter for recently completed tasks (requires actual timestamp in a real app)
    const completedTasks = actions.filter(a => a.status === 'complete').slice(0, 5)

    return (
        <div className="w-full space-y-4 pt-6">
            <h3 className="font-bold tracking-widest uppercase text-xs text-content-secondary ml-2">Recent Wins</h3>
            {completedTasks.length === 0 ? (
                <p className="text-sm text-content-secondary p-4 bg-surface-card rounded-xl text-center">Your garden is ready to grow.</p>
            ) : (
                <div className="space-y-2">
                    {completedTasks.map((t, idx) => (
                        <motion.div key={t.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                            <div className="bg-surface-card/50 px-4 py-3 rounded-xl border border-border-subtle flex items-center justify-between">
                                <span className="text-sm font-medium line-through text-content-secondary">{t.text}</span>
                                <span className="text-xs text-primary font-bold">✓ Done</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
