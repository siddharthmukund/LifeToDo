// src/components/ui/ThemeToggle.tsx
'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme, ThemeMode } from '@/hooks/useTheme'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { pref, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={14} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
    { value: 'system', label: 'System', icon: <Monitor size={14} /> },
  ]

  const currentOption = options.find((o) => o.value === pref) || options[2]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-card border border-border-default text-content-secondary hover:text-content-primary hover:bg-overlay-hover transition-colors active:scale-95 shadow-sm"
        aria-label="Toggle theme"
      >
        {currentOption.icon}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 right-0 w-36 bg-surface-elevated border border-border-default rounded-xl shadow-lg overflow-hidden z-50 p-1"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pref === option.value
                    ? 'bg-primary/10 text-primary-ink'
                    : 'text-content-secondary hover:bg-overlay-hover hover:text-content-primary'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={pref === option.value ? 'text-primary-ink' : ''}>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
                {pref === option.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
