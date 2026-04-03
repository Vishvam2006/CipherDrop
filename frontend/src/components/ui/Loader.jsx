export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-6 text-gray-400">
      <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
