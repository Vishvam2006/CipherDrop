import { Shield, Zap, Clock } from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant sharing',
    desc: 'Upload any file and get a shareable link in seconds.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    desc: 'Every link is unique, hashed, and tied to your account.',
  },
  {
    icon: Clock,
    title: 'Auto-expiring links',
    desc: 'Links expire automatically — no manual cleanup needed.',
  },
]

export function AuthHighlights() {
  return (
    <div className="flex flex-col justify-center gap-10 page-enter">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        <span className="text-xs font-semibold text-indigo-600 tracking-wide">Secure File Sharing</span>
      </div>

      {/* Headline */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 mb-3">
          Share files{' '}
          <span className="gradient-text">instantly.</span>
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-sm">
          Upload, generate a secure link, and share in seconds. Links expire automatically for your peace of mind.
        </p>
      </div>

      {/* Feature list */}
      <div className="flex flex-col gap-2.5">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="surface-card-muted p-4 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icon size={16} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        {[['60s', 'Link lifetime'], ['JWT', 'Auth'], ['∞', 'Files']].map(([val, label]) => (
          <div key={label}>
            <p className="text-lg font-bold gradient-text">{val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
