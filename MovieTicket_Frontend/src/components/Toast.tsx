import { useEffect, useState } from 'react'
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react'
import { cn } from '../lib/utils'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

let pushToast: ((message: string, kind?: ToastKind) => void) | null = null

export function toast(message: string, kind: ToastKind = 'info') {
  pushToast?.(message, kind)
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    pushToast = (message, kind = 'info') => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev, { id, message, kind }])
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200)
    }
    return () => {
      pushToast = null
    }
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100%,22rem)] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur',
            t.kind === 'success' && 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
            t.kind === 'error' && 'border-red-500/30 bg-red-950/90 text-red-100',
            t.kind === 'info' && 'border-white/10 bg-cinema-800/95 text-white',
          )}
        >
          {t.kind === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
          {t.kind === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          {t.kind === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="flex-1 text-sm leading-snug">{t.message}</p>
          <button
            type="button"
            className="opacity-60 hover:opacity-100"
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
