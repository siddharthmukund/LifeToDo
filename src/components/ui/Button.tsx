'use client'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-gtd-accent text-white hover:bg-gtd-accent-light active:scale-95 shadow-glow-accent',
  secondary: 'bg-gtd-surface text-gtd-text border border-white/10 hover:bg-white/10 active:scale-95',
  ghost:     'text-gtd-text-muted hover:text-gtd-text hover:bg-white/5 active:scale-95',
  danger:    'bg-gtd-danger/20 text-gtd-danger border border-gtd-danger/30 hover:bg-gtd-danger/30 active:scale-95',
  success:   'bg-gtd-success/20 text-gtd-success border border-gtd-success/30 hover:bg-gtd-success/30 active:scale-95',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center gap-2 font-medium',
      'transition-all duration-150 select-none cursor-pointer',
      'disabled:opacity-40 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  >
    {loading ? (
      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
      </svg>
    ) : children}
  </button>
))
Button.displayName = 'Button'
