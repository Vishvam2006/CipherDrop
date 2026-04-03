export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-6 text-[var(--text-muted)]">
      <div className="w-4 h-4 border-2 border-[var(--border-accent)] border-t-[var(--accent)] rounded-full animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
