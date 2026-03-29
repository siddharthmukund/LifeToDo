'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import { useADHDMode } from '@/hooks/useADHDMode'
import type { InboxItem } from '@/types'

interface ConversationalClarifyProps {
    item: InboxItem
    onConfirm: (destination: string) => void
    onSkip: () => void
}

export function ConversationalClarify({ item, onConfirm, onSkip }: ConversationalClarifyProps) {
    const { isADHDMode } = useADHDMode()
    const t = useTranslations(isADHDMode ? 'adhd' : 'common')
    
    if (!isADHDMode) return null
    // In actual implementation, the AI suggestion would be fetched based on item.text
    const isMockSuggestion = true

    return (
        <div className="flex flex-col h-full animate-fade-in items-center justify-center p-6 space-y-6">
            <h2 className="text-xl font-bold text-center">"{item.text}"</h2>
            
            <Card className="w-full max-w-sm p-5 border-primary/20 bg-primary/5">
                <p className="text-sm font-medium mb-4">
                   AI: "Quick phone call? I'd say ~5 min, 📱 phone, low energy."
                </p>
                <div className="flex flex-col gap-2">
                    <Button onClick={() => onConfirm('next_action')} className="w-full">✓ Looks right</Button>
                    <Button variant="secondary" onClick={() => onConfirm('adjust_action')} className="w-full">✏️ Adjust</Button>
                    <Button variant="ghost" onClick={onSkip} className="w-full">Skip — I'll do this later</Button>
                </div>
            </Card>
        </div>
    )
}
