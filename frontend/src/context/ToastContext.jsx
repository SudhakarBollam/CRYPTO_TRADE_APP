import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, variant = 'info') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4500)
  }, [])

  const success = useCallback((m) => push(m, 'success'), [push])
  const error = useCallback((m) => push(m, 'error'), [push])

  // Do not put `toasts` in context value: it changes every toast add/remove and would
  // break useEffect deps that list the whole `useToast()` return value.
  const value = useMemo(() => ({ push, success, error }), [push, success, error])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.variant}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
