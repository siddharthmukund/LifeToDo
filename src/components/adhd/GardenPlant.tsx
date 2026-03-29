'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface GardenPlantProps {
    stage: 'blooming' | 'growing' | 'resting'
}

export function GardenPlant({ stage }: GardenPlantProps) {
    const isBlooming = stage === 'blooming'
    const isResting = stage === 'resting'
    
    return (
        <div className="flex flex-col items-center justify-end h-full">
            <motion.div
                animate={{
                    scale: isBlooming ? [1, 1.1, 1] : 1,
                    opacity: isResting ? 0.6 : 1,
                    rotate: isResting ? -5 : 0
                }}
                transition={{ 
                    duration: 3, 
                    repeat: isBlooming ? Infinity : 0, 
                    ease: "easeInOut" 
                }}
            >
                <div className="text-4xl">
                    {stage === 'blooming' ? '🌸' : stage === 'growing' ? '🌿' : '🌱'}
                </div>
            </motion.div>
        </div>
    )
}
