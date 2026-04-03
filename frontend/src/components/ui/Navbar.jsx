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
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      {/* Desktop */}
      <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,.35)' }}
          >
            <Zap size={15} fill="white" className="text-white" />
          </div>
          <span className="font-bold text-[15px] text-gray-900 tracking-tight select-none">
            Cipher<span className="gradient-text">Drop</span>
          </span>
        </div>

        {/* Nav pills */}
        <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl border border-gray-200 bg-gray-50">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                activePage === id
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white'
              }`}
              style={activePage === id ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden md:block text-xs text-gray-400 font-medium truncate max-w-[180px]">
              {email}
            </span>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-lg cursor-pointer transition-all duration-200"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom tab */}
      <div className="sm:hidden flex border-t border-gray-200 px-2 py-1">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium rounded-lg cursor-pointer transition-colors ${
              activePage === id ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
