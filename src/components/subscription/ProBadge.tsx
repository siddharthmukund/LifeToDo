// src/components/subscription/ProBadge.tsx
// Small badge shown next to Pro-gated features.
// iCCW #6 D5C deliverable.

export function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider
                  text-primary-ink bg-primary/15 border border-primary/30
                  px-1.5 py-0.5 rounded-full ${className}`}
    >
      Pro
    </span>
  )
}
