'use client'

import React from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useADHDMode } from '@/hooks/useADHDMode'

interface NotTodaySwipeProps {
  onSwipeSkip: () => void
  children: React.ReactNode
}

export function NotTodaySwipe({ onSwipeSkip, children }: NotTodaySwipeProps) {
  const { isADHDMode } = useADHDMode()
  const t = useTranslations(isADHDMode ? 'adhd' : 'common')
  const controls = useAnimation()
  
  if (!isADHDMode) return <>{children}</>

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > 150 || velocity > 500) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } })
      onSwipeSkip()
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
        {/* Background indicator */}
        <div className="absolute inset-y-0 left-0 w-full flex items-center bg-status-info/10 pl-6 rounded-2xl opacity-50">
            <span className="text-status-info font-bold text-sm tracking-widest">{t('not_today')}</span>
        </div>
        
        {/* Draggable Card */}
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            animate={controls}
            whileDrag={{ scale: 0.98, cursor: 'grabbing' }}
            className="relative z-10 bg-surface-base w-full cursor-grab active:cursor-grabbing"
        >
            {children}
        </motion.div>
    </div>
  )
}
