'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, RefreshCw, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useContentDrafter } from './useContentDrafter';

interface Props {
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  isADHDMode?: boolean;
}

export function ContentDraftSheet({ taskTitle, isOpen, onClose, userRole, isADHDMode = false }: Props) {
  const { result, loading, error, copied, draft, copy, clear } = useContentDrafter(userRole);

  function handleOpen() {
    if (!result && !loading) void draft(taskTitle);
  }

  // Auto-trigger when opened
  if (isOpen && !result && !loading && !error) {
    void draft(taskTitle);
  }

  // ADHD mode: auto-copy + minimal UI
  if (isADHDMode && result && !copied) {
    void copy();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-surface-base rounded-t-2xl max-h-[70vh] flex flex-col"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-content-primary">Draft</p>
                  <p className="text-xs text-content-muted truncate max-w-[200px]">{taskTitle}</p>
                </div>
              </div>
              <button onClick={onClose}><X className="w-4 h-4 text-content-muted" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-content-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Drafting…
                </div>
              )}
              {error && <p className="text-sm text-status-danger">{error}</p>}
              {result && (
                <>
                  {result.suggestedSubject && (
                    <div className="rounded-lg bg-surface-card border border-border-subtle p-3">
                      <p className="text-[10px] text-content-muted uppercase tracking-wide mb-1">Subject</p>
                      <p className="text-sm text-content-primary font-medium">{result.suggestedSubject}</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-surface-card border border-border-subtle p-3">
                    <p className="text-sm text-content-primary whitespace-pre-wrap leading-relaxed">
                      {result.draft}
                    </p>
                  </div>
                </>
              )}
            </div>

            {result && (
              <div className="flex gap-2 p-4 border-t border-border-subtle">
                <button
                  onClick={copy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy draft'}
                </button>
                <button
                  onClick={() => { clear(); void draft(taskTitle); }}
                  className="px-3 py-2.5 border border-border-default rounded-xl text-content-secondary"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
