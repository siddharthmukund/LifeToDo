// errors/index.ts
// Barrel export — iCCW #4 Error Handling layer
export { ERROR_CODES, ERROR_USER_MESSAGES, createGTDError } from './types'
export { reportError, reportNativeError, pruneErrorLog }    from './errorReporter'
export { ErrorBoundary }                                    from './ErrorBoundary'
export { useErrorHandler }                                  from './useErrorHandler'
export type { GTDError, ErrorCode }                         from './types'
