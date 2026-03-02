'use client'
// components/ui/HealthScoreRing.tsx
// Circular SVG progress ring for the GTD Health Score (0-100).
// Color-coded by tier: green (90+), cyan/primary (70-89), yellow (40-69), red (<40).
// Animated stroke-dashoffset transition on mount.

const RADIUS       = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS   // ≈ 282.74

// Returns CSS custom-property strings so the ring colour automatically adapts
// to the active theme without any JS re-render. SVG inline styles accept var().
function scoreColor(score: number): string {
  if (score >= 90) return 'var(--status-ok-fg)'    // green  → adapts per theme
  if (score >= 70) return 'var(--primary-ink)'      // cyan   → adapts per theme
  if (score >= 40) return 'var(--status-warn-fg)'   // yellow → adapts per theme
  return 'var(--status-danger-fg)'                   // red    → adapts per theme
}

function gradeLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 45) return 'Low'
  return 'Critical'
}

interface HealthScoreRingProps {
  /** 0-100 score value */
  score:        number
  /** SVG diameter in px (default 120) */
  size?:        number
  /** Ring stroke thickness (default 8) */
  strokeWidth?: number
  /** Sub-label below the number (defaults to grade label) */
  label?:       string
  /** Show grade text below ring (default true) */
  showGrade?:   boolean
}

export function HealthScoreRing({
  score,
  size        = 120,
  strokeWidth = 8,
  label,
  showGrade   = true,
}: HealthScoreRingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, score)) / 100)
  const color  = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Ring + number */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* SVG ring — rotated so arc starts at 12 o'clock */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          {/* Track (background circle) */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-content-primary/10"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Centred score text (upright, not rotated) */}
        <div className="z-10 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: size * 0.22, color }}
          >
            {score}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-0.5">
            {label ?? 'Score'}
          </span>
        </div>
      </div>

      {/* Grade badge */}
      {showGrade && (
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {gradeLabel(score)}
        </span>
      )}
    </div>
  )
}
