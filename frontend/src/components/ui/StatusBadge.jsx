const TONE = {
  live:    'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  expired: 'bg-red-50 text-red-600 border border-red-200',
  neutral: 'bg-gray-100 text-gray-500 border border-gray-200',
}

export function StatusBadge({ label, tone }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${TONE[tone] ?? TONE.neutral}`}>
      {label}
    </span>
  )
}
