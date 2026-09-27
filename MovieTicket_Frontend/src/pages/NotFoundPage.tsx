import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center animate-fade-up">
      <p className="text-sm uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-white/55">That route doesn’t exist in CineBook.</p>
      <Link to="/" className="mt-8">
        <Button>Back home</Button>
      </Link>
    </div>
  )
}
