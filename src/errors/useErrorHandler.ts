'use client'
// errors/useErrorHandler.ts
// Hook that provides a programmatic error handler for async operations.
// Captures the error to db.error_log and surfaces a user-friendly toast
// via the global toast store (when available).
//
// Usage:
//   const handleError = useErrorHandler()
//   try { await addInboxItem(text) }
//   catch (err) { handleError('CAPTURE_FAILED', err) }

import { useCallback }       from 'react'
import { reportNativeError } from './errorReporter'
import type { ErrorCode }    from './types'
import { ERROR_USER_MESSAGES } from './types'

interface UseErrorHandlerResult {
  /**
   * Handle an error from an async operation.
   * Returns the user-friendly message so the caller can display it.
   */
  handleError: (code: ErrorCode, err: unknown, context?: Record<string, string>) => string
}

export function useErrorHandler(): UseErrorHandlerResult {
  const handleError = useCallback(
    (code: ErrorCode, err: unknown, context?: Record<string, string>): string => {
      // Fire-and-forget write to error_log
      void reportNativeError(code, err, context)

      // Log to console in dev
      if (process.env.NODE_ENV === 'development') {
        console.error(`[${code}]`, err)
      }

      return ERROR_USER_MESSAGES[code]
    },
    [],
  )

  return { handleError }
}
