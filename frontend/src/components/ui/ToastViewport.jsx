import { useCallback, useRef, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { ToastContext } from '../../context/toast-context.js'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(({ title, message, tone = 'success' }) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, title, message, tone }])
    setTimeout(() => dismissToast(id), 4500)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5"
        style={{ width: 'min(360px, calc(100vw - 24px))' }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item ${toast.tone === 'error' ? 'toast-error' : 'toast-success'}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {toast.tone === 'error'
                  ? <XCircle size={16} className="text-red-500" />
                  : <CheckCircle2 size={16} className="text-emerald-500" />}
              </div>
              <div className="min-w-0 flex-1">
                {toast.title && <p className="text-sm font-semibold text-slate-900">{toast.title}</p>}
                {toast.message && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>}
              </div>
              <button type="button" onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
