// Tailwind class merging helper (lightweight — avoids clsx/tailwind-merge dep)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format a Date relative to now: "just now", "5 min ago", "yesterday", etc. */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)  return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1)    return 'yesterday'
  if (days < 7)      return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Energy colour token */
export function energyColor(energy: 'high' | 'medium' | 'low'): string {
  return { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' }[energy]
}

/** Energy label */
export function energyLabel(energy: 'high' | 'medium' | 'low'): string {
  return { high: '⚡ High', medium: '🔸 Med', low: '🌱 Low' }[energy]
}

/** Time estimate label */
export function timeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  return `${minutes / 60}h`
}

/** Day-of-week label */
export function dayLabel(day: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] ?? ''
}

/** Format HH:MM to 12h */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour  = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}
