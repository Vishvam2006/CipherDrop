import { Inbox } from 'lucide-react'

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
        <Inbox size={20} className="text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1 max-w-[240px] leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  )
}
