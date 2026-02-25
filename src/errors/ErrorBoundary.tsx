'use client'
// errors/ErrorBoundary.tsx
// React class-based error boundary.
// Catches synchronous render errors in the subtree, logs them to db.error_log,
// and renders a fallback UI instead of a white screen.
//
// Usage:
//   <ErrorBoundary fallback={<p>Something went wrong</p>}>
//     <SomeComponent />
//   </ErrorBoundary>

import React from 'react'
import { RefreshCw } from 'lucide-react'
import { reportError } from './errorReporter'
import { createGTDError } from './types'

// ── Props & State ─────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children:  React.ReactNode
  /** Custom fallback UI. If omitted, the built-in card is shown. */
  fallback?: React.ReactNode
  /** Boundary identifier for error context (e.g. 'InboxPage') */
  name?:     string
}

interface ErrorBoundaryState {
  hasError:  boolean
  errorMsg?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMsg: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const gtdError = createGTDError(
      'RENDER_ERROR',
      error.message,
      {
        component:  this.props.name ?? 'unknown',
        componentStack: info.componentStack?.slice(0, 500) ?? '',
      }
    )
    gtdError.stack = error.stack
    void reportError(gtdError)
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMsg: undefined })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <RefreshCw size={20} className="text-red-400" />
        </div>
        <div>
          <p className="font-display font-bold text-white mb-1">Something went wrong</p>
          <p className="text-sm text-slate-400">
            {this.state.errorMsg ?? 'An unexpected error occurred. Your data is safe.'}
          </p>
        </div>
        <button
          onClick={this.handleReset}
          className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
        >
          Try again →
        </button>
      </div>
    )
  }
}
