import { cn } from '../lib/utils'

export function Button({
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-soft',
        variant === 'secondary' && 'border border-white/15 bg-white/5 hover:bg-white/10',
        variant === 'ghost' && 'hover:bg-white/5',
        variant === 'danger' && 'bg-red-600/90 hover:bg-red-500',
        className,
      )}
      {...props}
    />
  )
}

export function Input({
  className,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-white/70">{label}</span>}
      <input
        className={cn(
          'w-full rounded-xl border border-white/10 bg-cinema-900 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-white/30 focus:border-accent/60 focus:ring-2 focus:ring-accent/20',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  )
}

export function TextArea({
  className,
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-white/70">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-white/10 bg-cinema-900 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-white/30 focus:border-accent/60 focus:ring-2 focus:ring-accent/20',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  )
}

export function Select({
  className,
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-white/70">{label}</span>}
      <select
        className={cn(
          'w-full rounded-xl border border-white/10 bg-cinema-900 px-3.5 py-2.5 text-sm outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-cinema-900/40 px-6 py-16 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-white/55">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/55 sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-4 text-sm text-red-100">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-accent-soft underline-offset-2 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'success' | 'danger' | 'gold'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tone === 'neutral' && 'bg-white/10 text-white/80',
        tone === 'success' && 'bg-emerald-500/20 text-emerald-300',
        tone === 'danger' && 'bg-red-500/20 text-red-300',
        tone === 'gold' && 'bg-gold/20 text-gold',
      )}
    >
      {children}
    </span>
  )
}
