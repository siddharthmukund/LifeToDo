'use client'
// Modal — bottom-sheet overlay for contextual actions.
// glass-panel surface, spring animation, Escape-key + backdrop dismiss.
// iCCW #13: role="dialog", aria-modal, aria-labelledby, focus trap via FocusTrap.

import { useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FocusTrap } from '@/a11y/FocusTrap'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title?:     string
  /** Accessible label when no visible title is rendered (fullScreen modals). */
  ariaLabel?: string
  children:   React.ReactNode
  className?: string
  /** When true, fills the full screen (ClarifyFlow, FocusTimer) */
  fullScreen?: boolean
}

export function Modal({ open, onClose, title, ariaLabel, children, className, fullScreen }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — click to dismiss, aria-hidden so SR skips it */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/*
            Focus trap wraps the entire sheet.
            - Cycles Tab / Shift+Tab within the dialog.
            - Fires onClose when Escape is pressed.
            - Saves activeElement on open; restores it on close.
          */}
          <FocusTrap active={open} onEscape={onClose} className="contents">
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-label={!title ? (ariaLabel ?? 'Dialog') : undefined}
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
              {/* Drag handle (decorative) */}
              {!fullScreen && (
                <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
                  <div className="w-10 h-1 rounded-full bg-overlay-active" />
                </div>
              )}

              {/* Header row */}
              {(title || !fullScreen) && (
                <div className="flex items-center justify-between px-6 pt-3 pb-2">
                  {title && (
                    <h2 id={titleId} className="text-lg font-display font-bold text-content-primary">
                      {title}
                    </h2>
                  )}
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 rounded-full text-content-muted hover:text-content-primary hover:bg-overlay-hover transition-colors"
                    aria-label="Close dialog"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className={cn('px-6 pb-10', fullScreen && 'h-[calc(100%-56px)] overflow-y-auto custom-scrollbar')}>
                {children}
              </div>
            </motion.div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  )
}
