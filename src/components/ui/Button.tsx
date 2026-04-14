'use client'
// Button — primary interactive element.
// Variants use Figma design tokens (primary = cyan, secondary = card-dark surface).

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-content-inverse font-bold hover:bg-primary/90 active:scale-95 shadow-glow-accent',
  secondary:
    'bg-surface-card text-content-primary border border-border-default font-semibold hover:border-primary/30 hover:bg-surface-elevated active:scale-95',
  ghost:
    'text-content-secondary font-medium hover:text-content-primary hover:bg-overlay-hover active:scale-95',
  danger:
    'bg-status-error/15 text-status-error border border-status-danger font-medium hover:bg-status-error/20 active:scale-95',
  success:
    'bg-status-success/15 text-status-success border border-status-ok font-medium hover:bg-status-ok/20 active:scale-95',
}

const sizes: Record<Size, string> = {
  // iCCW #13: min-h raised from 36px → 44px to meet WCAG 2.5.8 touch-target minimum.
  sm: 'px-4  py-2    text-xs   rounded-xl   min-h-[44px]',
  md: 'px-5  py-2.5  text-sm   rounded-2xl  min-h-[44px]',
  lg: 'px-6  py-3.5  text-base rounded-2xl  min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
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
      'inline-flex items-center justify-center gap-2',
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
      <span className="size-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
    ) : (
      children
    )}
  </button>
))
Button.displayName = 'Button'
