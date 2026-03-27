export function StatusBadge({ label, tone }) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>
}
