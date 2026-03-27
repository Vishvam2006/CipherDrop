import { Cloud } from 'lucide-react'

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Cloud size={20} className="text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
      </div>
    </div>
  )
}
