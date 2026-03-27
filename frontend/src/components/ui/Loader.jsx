export function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 py-6 px-1 text-slate-400">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            style={{ animation: 'pulse-dot 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  )
}
