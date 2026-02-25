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
    'bg-primary text-background-dark font-bold hover:bg-primary/90 active:scale-95 shadow-glow-accent',
  secondary:
    'bg-card-dark text-white border border-white/10 font-semibold hover:border-primary/30 hover:bg-card-elevated active:scale-95',
  ghost:
    'text-slate-400 font-medium hover:text-white hover:bg-white/5 active:scale-95',
  danger:
    'bg-red-500/15 text-red-400 border border-red-500/30 font-medium hover:bg-red-500/25 active:scale-95',
  success:
    'bg-green-500/15 text-green-400 border border-green-500/30 font-medium hover:bg-green-500/25 active:scale-95',
}

const sizes: Record<Size, string> = {
  sm: 'px-4  py-2    text-xs   rounded-xl   min-h-[36px]',
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
