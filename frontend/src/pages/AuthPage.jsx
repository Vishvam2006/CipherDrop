import { useState } from 'react'
import { useAuth }  from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { Shield, Zap, Clock, Eye, EyeOff, Mail, Lock } from 'lucide-react'

const FEATURES = [
  { icon: Zap,    title: 'Instant delivery',  desc: 'Upload a file and your friend receives a secure link via real-time socket.' },
  { icon: Shield, title: 'Hashed tokens',     desc: 'Every share link is backed by a SHA-256 token — only the intended recipient can access it.' },
  { icon: Clock,  title: 'Auto-expiring',     desc: 'Links self-destruct automatically — no manual cleanup or storage build-up.' },
]

export function AuthPage() {
  const { email: storedEmail, login, register } = useAuth()
  const { showToast } = useToast()
  const [mode,   setMode]   = useState('login')
  const [form,   setForm]   = useState({ email: storedEmail || '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [busy,   setBusy]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'register') {
        const res = await register(form)
        setForm((p) => ({ ...p, password: '' }))
        setMode('login')
        showToast({ title: 'Account created', message: res?.message || 'You can now sign in.', tone: 'success' })
        return
      }
      const res = await login(form)
      setForm((p) => ({ ...p, password: '' }))
      showToast({ title: 'Welcome back', message: res?.message || 'Signed in.', tone: 'success' })
    } catch (err) {
      showToast({ title: 'Authentication failed', message: err.message || 'Check your credentials.', tone: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-14"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(99,102,241,.08) 0%, transparent 65%)' }}
    >
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

        {/* ── Left column ── */}
        <div className="hidden lg:flex flex-col gap-8 page-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold text-indigo-600 tracking-wide">Secure File Sharing</span>
          </div>

          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Share files{' '}
              <span className="gradient-text">instantly.</span>
            </h1>
            <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-sm">
              Upload a file, pick a friend, and a secure one-time link is delivered live.
              Links expire automatically — built for privacy.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm transition-all duration-200 group cursor-default"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-8">
            {[['60 s', 'Link lifetime'], ['JWT', 'Auth method'], ['SHA-256', 'Token hash']].map(([val, label]) => (
              <div key={label}>
                <p className="text-xl font-bold gradient-text">{val}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="w-full page-enter">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-7 lg:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,.35)' }}
            >
              <Zap size={15} fill="white" className="text-white" />
            </div>
            <span className="font-bold text-[15px] text-gray-900 tracking-tight">
              Cipher<span className="gradient-text">Drop</span>
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'login' ? 'Access your secure file workspace' : 'Join and start sharing files securely'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex p-1 rounded-xl bg-gray-100 border border-gray-200 mb-7">
              {['login', 'register'].map((m) => (
                <button
                  key={m} type="button" onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-sm rounded-lg font-medium cursor-pointer transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com"
                    autoComplete="email" required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'} name="password"
                    value={form.password} onChange={handleChange}
                    placeholder={mode === 'login' ? 'Your password' : 'Min 8 characters'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,.3)' }}
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Please wait…
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-400 mt-6">
              Files are encrypted in transit · Links expire automatically
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
