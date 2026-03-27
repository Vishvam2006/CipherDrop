import { Zap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'

export function Navbar({ activePage, onNavigate, onLogout }) {
  const { email } = useAuth()

  return (
    <nav className="navbar-light sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-sm text-slate-900">
            Cipher<span className="gradient-text">Drop</span>
          </span>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-1">
          {[['upload', 'Upload'], ['files', 'My Files']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activePage === id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-slate-400 truncate max-w-[160px]">{email}</span>
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
