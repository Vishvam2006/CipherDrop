import { Zap, UploadCloud, Files, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'

const NAV = [
  { id: 'upload',  label: 'Upload',   Icon: UploadCloud },
  { id: 'files',   label: 'My Files', Icon: Files },
  { id: 'friends', label: 'Friends',  Icon: Users },
]

export function Navbar({ activePage, onNavigate, onLogout }) {
  const { email } = useAuth()

  return (
    <nav className="navbar">
      {/* Desktop row */}
      <div className="max-w-6xl mx-auto px-5 h-15 flex items-center justify-between gap-4"
        style={{ height: '60px' }}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 2px 12px rgba(99,102,241,.35)',
            }}>
            <Zap size={15} fill="white" className="text-white" />
          </div>
          <span className="font-bold text-[15px] text-[var(--text-primary)] tracking-tight select-none">
            Cipher<span className="gradient-text">Drop</span>
          </span>
        </div>

        {/* Centre nav */}
        <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl border border-[var(--border)]"
          style={{ background: 'var(--bg-subtle)' }}>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`btn flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium ${
                activePage === id
                  ? 'text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/80'
              }`}
              style={activePage === id
                ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }
                : {}}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden md:block text-[12px] text-[var(--text-muted)] truncate max-w-[180px] font-medium">
              {email}
            </span>
          )}
          <button onClick={onLogout}
            className="btn btn-ghost px-3 py-2 text-[12px] gap-1.5 text-[var(--text-muted)] hover:text-[var(--red)]"
            style={{ borderColor: 'var(--border)' }}>
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom tab */}
      <div className="sm:hidden flex border-t border-[var(--border)] px-2 py-1">
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onNavigate(id)}
            className={`btn flex-1 flex-col gap-0.5 py-2 text-[11px] rounded-lg font-medium ${
              activePage === id
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-muted)]'
            }`}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
