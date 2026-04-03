import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { Shield, Zap, Clock, Eye, EyeOff, Mail, Lock } from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant delivery',
    desc: 'Upload any file and your friend receives a secure link in seconds via real-time socket.',
  },
  {
    icon: Shield,
    title: 'Hashed tokens',
    desc: 'Every share link is backed by a SHA-256 token — only the intended recipient can access it.',
  },
  {
    icon: Clock,
    title: 'Auto-expiring',
    desc: 'Links self-destruct and files are cleaned up automatically — no manual effort needed.',
  },
]

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-white/60 hover:border-[var(--border-accent)] hover:bg-[var(--accent-light)] transition-all duration-200 group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent-light)] border border-[var(--accent-mid)] shrink-0 group-hover:scale-110 transition-transform">
        <Icon size={16} className="text-[var(--accent)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export function AuthPage() {
  const { email: storedEmail, login, register } = useAuth()
  const { showToast } = useToast()

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: storedEmail || '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

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
    <div className="bg-page min-h-screen flex items-center justify-center px-5 py-14">

      {/* Outer max-width container */}
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

        {/* ── Left: hero copy ── */}
        <div className="hidden lg:flex flex-col gap-8 page-enter">
          {/* Eyebrow */}
          <div className="tag w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            Secure File Sharing
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
              Share files{' '}
              <span className="gradient-text">instantly.</span>
            </h1>
            <p className="mt-4 text-base text-[var(--text-muted)] leading-relaxed max-w-sm">
              Upload a file, pick a friend, and a secure one-time link is delivered live.
              Links expire automatically — built for privacy.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {FEATURES.map((f) => <FeatureItem key={f.title} {...f} />)}
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-8">
            {[['60 s', 'Link lifetime'], ['JWT', 'Auth'], ['SHA-256', 'Token hash']].map(([val, label]) => (
              <div key={label}>
                <p className="text-xl font-bold gradient-text">{val}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: auth form card ── */}
        <div className="w-full page-enter">
          {/* Brand (mobile only) */}
          <div className="flex items-center gap-2.5 mb-7 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 10px rgba(99,102,241,.35)' }}>
              <Zap size={15} fill="white" className="text-white" />
            </div>
            <span className="font-bold text-[15px] text-[var(--text-primary)]">
              Cipher<span className="gradient-text">Drop</span>
            </span>
          </div>

          <div className="card p-8">
            {/* Card header */}
            <div className="mb-7">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {mode === 'login'
                  ? 'Access your secure file workspace'
                  : 'Join and start sharing files securely'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] mb-7">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`btn flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-[var(--text-primary)] shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com"
                    autoComplete="email" required
                    className="premium-input pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPw ? 'text' : 'password'} name="password"
                    value={form.password} onChange={handleChange}
                    placeholder={mode === 'login' ? 'Your password' : 'Min 8 characters'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="premium-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="btn absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-0.5"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={busy} className="btn btn-primary w-full mt-1 py-3">
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Please wait…
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-[11px] text-[var(--text-muted)] mt-6">
              Files are encrypted in transit · Links expire automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
