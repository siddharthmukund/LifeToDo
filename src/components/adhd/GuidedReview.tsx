'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import { useADHDMode } from '@/hooks/useADHDMode'

export function GuidedReview() {
    const { isADHDMode } = useADHDMode()
    const t = useTranslations(isADHDMode ? 'adhd' : 'common')
    const [step, setStep] = useState(1)
    
    if (!isADHDMode) return null

    const steps = [
        "Clear inbox",
        "Stale stuff",
        "Projects check",
        "Next week",
        "Win of the week"
    ]

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 space-y-6">
            <div className="w-full max-w-sm text-center">
                <p className="text-xs uppercase tracking-widest text-content-secondary mb-2">
                    Step {step} of 5: {steps[step - 1]}
                </p>
                
                {step === 1 && <h2 className="text-xl font-bold">Inbox empty?</h2>}
                {step === 2 && <h2 className="text-xl font-bold">These 4 haven't moved. Keep or archive?</h2>}
                {step === 3 && <h2 className="text-xl font-bold">Any projects need a new next action?</h2>}
                {step === 4 && <h2 className="text-xl font-bold">Pick 1-3 focus areas for the week.</h2>}
                {step === 5 && <h2 className="text-xl font-bold">What are you proud of?</h2>}
            </div>

            <div className="flex w-full max-w-sm justify-between mt-8">
                <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>Back</Button>
                {step < 5 
                    ? <Button onClick={() => setStep(s => Math.min(5, s + 1))}>Next</Button>
                    : <Button onClick={() => alert('Review Done! Garden blooms.')}>Finish Review</Button>
                }
            </div>
            
            <Button variant="ghost" size="sm" className="mt-8 text-xs underline">Save progress — finish later.</Button>
        </div>
    )
}
