import { useCallback, useState } from 'react'
import { ToastContext } from './toast-context.js'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(({ title, message, tone = 'info' }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`

    setToasts((current) => [...current, { id, title, message, tone }])

    window.setTimeout(() => {
      dismissToast(id)
    }, 4200)
  }, [dismissToast])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}
