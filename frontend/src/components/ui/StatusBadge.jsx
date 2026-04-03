export function StatusBadge({ label, tone }) {
  const cls = {
    live:    'badge badge-live',
    warning: 'badge badge-warning',
    expired: 'badge badge-expired',
    neutral: 'badge badge-neutral',
  }[tone] ?? 'badge badge-neutral'

  return <span className={cls}>{label}</span>
}
