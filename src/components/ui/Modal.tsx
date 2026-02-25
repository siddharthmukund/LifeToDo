'use client'
// Modal — bottom-sheet overlay for contextual actions.
// glass-panel surface, spring animation, Escape-key + backdrop dismiss.

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title?:     string
  children:   React.ReactNode
  className?: string
  /** When true, fills the full screen (ClarifyFlow, FocusTimer) */
  fullScreen?: boolean
}

export function Modal({ open, onClose, title, children, className, fullScreen }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="modal"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'fixed z-50 glass-panel',
              fullScreen
                ? 'inset-0'
                : 'bottom-0 left-0 right-0 max-w-[430px] mx-auto rounded-t-3xl max-h-[92vh] overflow-y-auto',
              className,
            )}
          >
            {/* Drag handle */}
            {!fullScreen && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
            )}

            {/* Header row */}
            {(title || !fullScreen) && (
              <div className="flex items-center justify-between px-6 pt-3 pb-2">
                {title && (
                  <h2 className="text-lg font-display font-bold text-white">{title}</h2>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto p-2 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <div className={cn('px-6 pb-10', fullScreen && 'h-[calc(100%-56px)] overflow-y-auto custom-scrollbar')}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
