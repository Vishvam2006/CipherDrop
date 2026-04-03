import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center">
        <Inbox size={20} className="text-[var(--text-muted)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[240px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
