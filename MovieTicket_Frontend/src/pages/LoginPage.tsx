import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'
import { Button, Input } from '../components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      toast('Welcome back!', 'success')
      navigate(redirect, { replace: true })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Login failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="rounded-3xl border border-white/8 bg-cinema-900/70 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-white/55">Sign in to book seats and manage tickets.</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
          />
          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/50">
          New here?{' '}
          <Link to="/register" className="text-accent-soft hover:underline">
            Create an account
          </Link>
        </p>
        <div className="mt-6 rounded-xl border border-white/8 bg-black/20 p-3 text-xs text-white/45">
          <p className="font-medium text-white/60">Demo accounts</p>
          <p className="mt-1">Customer: rahul@test.com / User@123</p>
          <p>Admin: admin@cinema.com / Admin@123</p>
        </div>
      </div>
    </div>
  )
}
