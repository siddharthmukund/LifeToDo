'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import { useADHDMode } from '@/hooks/useADHDMode'

export function EveningWindDown() {
  const { isADHDMode } = useADHDMode()
  const t = useTranslations(isADHDMode ? 'adhd' : 'common')
  
  if (!isADHDMode) return null

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 h-full text-center">
        <h2 className="text-2xl font-bold">{t('evening_winddown')}</h2>
        
        <div className="space-y-4 max-w-sm w-full">
            <Card className="p-4 bg-muted/30">
                <p className="text-sm font-bold opacity-75 uppercase tracking-widest mb-1">Morning 3 check</p>
                <p className="text-xl">✅ 2 out of 3 done!</p>
            </Card>

            <Card className="p-4 border-primary/20 bg-primary/5">
                <p className="text-sm font-bold opacity-75 uppercase tracking-widest mb-3">Quick Capture</p>
                <input type="text" placeholder="Anything on your mind for tomorrow?" className="w-full bg-surface-base px-3 py-2 rounded-lg border-border-subtle" />
            </Card>
        </div>
        
        <p className="text-sm text-content-secondary mt-8 opacity-80 italic max-w-xs">
            "Good night. Everything's safe in the system. 🌙"
        </p>
    </div>
  )
}
