import { Link } from 'react-router-dom'
import type { Movie } from '../types'
import { cn, formatDate } from '../lib/utils'

export function MovieCard({ movie, className }: { movie: Movie; className?: string }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className={cn(
        'group overflow-hidden rounded-2xl border border-white/8 bg-cinema-800/60 shadow-xl transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-accent/10',
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-cinema-700">
        {movie.imageUrl ? (
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/30">No poster</div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-16">
          <p className="line-clamp-2 text-sm font-semibold">{movie.title}</p>
          <p className="mt-1 text-xs text-white/60">
            {movie.genre} · {movie.language} · {movie.durationMinutes}m
          </p>
        </div>
        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-gold">
          {movie.rating}
        </span>
      </div>
      <div className="px-3 py-2 text-[11px] text-white/45">{formatDate(movie.releaseDate)}</div>
    </Link>
  )
}

export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-cinema-800">
          <div className="aspect-[2/3] bg-cinema-700" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 rounded bg-cinema-700" />
            <div className="h-2 w-1/2 rounded bg-cinema-700" />
          </div>
        </div>
      ))}
    </div>
  )
}
