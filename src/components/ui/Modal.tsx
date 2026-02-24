'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  /** If true, fills the full screen (used for ClarifyFlow on mobile) */
  fullScreen?: boolean
}

export function Modal({ open, onClose, title, children, className, fullScreen }: ModalProps) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key closes modal
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="modal"
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-gtd-surface',
              fullScreen
                ? 'inset-0'
                : 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh] overflow-y-auto',
              className,
            )}
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              {!fullScreen && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
              )}
              {title && (
                <h2 className="text-base font-semibold text-gtd-text pt-2">{title}</h2>
              )}
              <button
                onClick={onClose}
                className={cn(
                  'ml-auto p-2 rounded-full text-gtd-muted hover:text-gtd-text hover:bg-white/10',
                  !title && 'mt-2',
                )}
              >
                <X size={20} />
              </button>
            </div>

            <div className={cn('px-5 pb-8', fullScreen && 'h-[calc(100%-60px)] overflow-y-auto')}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
