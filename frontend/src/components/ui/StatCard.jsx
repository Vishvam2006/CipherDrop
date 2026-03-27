export function StatCard({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="surface-card-muted p-5 flex flex-col gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-1">
          <Icon size={15} className="text-indigo-500" />
        </div>
      )}
      <p className="text-xs font-semibold tracking-widest uppercase text-slate-400">{eyebrow}</p>
      <p className="text-lg font-bold text-slate-900">{title}</p>
      {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
    </div>
  )
}
