import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react'

export function AuthForm() {
  const { email: storedEmail, login, register } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState('login')
  const [formState, setFormState] = useState({ email: storedEmail || '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormState((c) => ({ ...c, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (mode === 'register') {
        const res = await register(formState)
        setFormState((c) => ({ ...c, password: '' }))
        setMode('login')
        showToast({ title: 'Account created', message: res?.message || 'You can now sign in.', tone: 'success' })
        return
      }
      const res = await login(formState)
      setFormState((c) => ({ ...c, password: '' }))
      showToast({ title: 'Welcome back', message: res?.message || 'Signed in.', tone: 'success' })
    } catch (err) {
      showToast({ title: 'Authentication failed', message: err.message || 'Check your credentials.', tone: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full page-enter">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-7">
        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <span className="font-bold text-base text-slate-900">
          Cipher<span className="gradient-text">Drop</span>
        </span>
      </div>

      {/* Card */}
      <div className="surface-card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'login' ? 'Access your file workspace' : 'Start sharing files securely'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" name="email" value={formState.email}
                onChange={handleInputChange} placeholder="you@example.com"
                autoComplete="email" required className="premium-input pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'} name="password"
                value={formState.password} onChange={handleInputChange}
                placeholder={mode === 'login' ? 'Your password' : 'Create a password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required className="premium-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-1">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Please wait…
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Files are encrypted and links expire automatically.
      </p>
    </div>
  )
}
