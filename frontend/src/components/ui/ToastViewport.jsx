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
          <div
            key={toast.id}
            className={`toast-enter bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-lg flex items-start gap-3 ${
              toast.tone === 'error' ? 'border-l-[3px] border-l-red-500' : 'border-l-[3px] border-l-green-500'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.tone === 'error'
                ? <XCircle size={16} className="text-red-500" />
                : <CheckCircle2 size={16} className="text-green-500" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-sm font-semibold text-gray-900">{toast.title}</p>}
              {toast.message && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
