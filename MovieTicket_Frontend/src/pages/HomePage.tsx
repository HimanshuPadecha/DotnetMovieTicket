import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { moviesApi } from '../api'
import { MovieCard, MovieGridSkeleton } from '../components/MovieCard'
import { Button, EmptyState, ErrorBanner, Input } from '../components/ui'
import { getErrorMessage } from '../api/client'

export function HomePage() {
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')

  const genresQ = useQuery({ queryKey: ['genres'], queryFn: moviesApi.genres })
  const moviesQ = useQuery({
    queryKey: ['movies', { search, genre }],
    queryFn: () =>
      moviesApi.list({
        search: search || undefined,
        genre: genre || undefined,
      }),
  })

  const { nowShowing, comingSoon, featured } = useMemo(() => {
    const list = moviesQ.data ?? []
    const now = Date.now()
    const showing = list.filter((m) => new Date(m.releaseDate).getTime() <= now)
    const upcoming = list.filter((m) => new Date(m.releaseDate).getTime() > now)
    return {
      nowShowing: showing.length ? showing : list,
      comingSoon: upcoming,
      featured: list[0],
    }
  }, [moviesQ.data])

  return (
    <div className="space-y-12 animate-fade-up">
      <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-cinema-900">
        <div className="absolute inset-0">
          {featured?.backdropUrl || featured?.imageUrl ? (
            <img
              src={featured.backdropUrl || featured.imageUrl || ''}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/85 to-cinema-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-transparent" />
        </div>

        <div className="relative grid gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="h-3.5 w-3.5" /> Premium cinema booking
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Cine<span className="text-accent-soft">Book</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/65 sm:text-lg">
              Discover films, pick your seats, and book tickets in seconds — a dark cinematic booking
              experience powered by live showtimes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/movies">
                <Button>
                  Browse movies <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {featured && (
                <Link to={`/movies/${featured.id}`}>
                  <Button variant="secondary">Featured: {featured.title}</Button>
                </Link>
              )}
            </div>
          </div>

          <form
            className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                className="pl-10"
                placeholder="Search movies…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search movies"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGenre('')}
                className={`rounded-lg px-3 py-1.5 text-xs ${!genre ? 'bg-accent text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                All
              </button>
              {(genresQ.data ?? []).slice(0, 8).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g === genre ? '' : g)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${genre === g ? 'bg-accent text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {moviesQ.isError && (
        <ErrorBanner
          message={getErrorMessage(moviesQ.error, 'Failed to load movies')}
          onRetry={() => void moviesQ.refetch()}
        />
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Now showing</h2>
            <p className="mt-1 text-sm text-white/50">Book tickets for films on screen</p>
          </div>
          <Link to="/movies" className="text-sm text-accent-soft hover:underline">
            View all
          </Link>
        </div>
        {moviesQ.isLoading ? (
          <MovieGridSkeleton />
        ) : nowShowing.length === 0 ? (
          <EmptyState title="No movies found" description="Try a different search or genre." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {nowShowing.slice(0, 10).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </section>

      {comingSoon.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold">Coming soon</h2>
            <p className="mt-1 text-sm text-white/50">Upcoming releases</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {comingSoon.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
