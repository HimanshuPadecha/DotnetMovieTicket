import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Languages, MapPin, Star } from 'lucide-react'
import { moviesApi, theatresApi } from '../api'
import { getErrorMessage } from '../api/client'
import { Badge, Button, EmptyState, ErrorBanner, Select, Spinner } from '../components/ui'
import { formatCurrency, formatDate, formatTime } from '../lib/utils'
import type { ShowSummary } from '../types'

export function MovieDetailPage() {
  const { id } = useParams()
  const movieId = Number(id)
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')

  const movieQ = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => moviesApi.get(movieId),
    enabled: Number.isFinite(movieId),
  })
  const citiesQ = useQuery({ queryKey: ['cities'], queryFn: theatresApi.cities })

  const shows = useMemo(() => {
    let list = movieQ.data?.shows ?? []
    if (city) list = list.filter((s) => s.city.toLowerCase() === city.toLowerCase())
    if (date) {
      list = list.filter((s) => {
        const d = new Date(s.startTime)
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return ymd === date
      })
    }
    return list
  }, [movieQ.data, city, date])

  const byTheatre = useMemo(() => {
    const map = new Map<string, ShowSummary[]>()
    for (const s of shows) {
      const key = `${s.theatreId ?? s.theatre}|${s.theatre}|${s.city}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const [, theatre, cityName] = key.split('|')
      return { theatre, city: cityName, shows: items.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)) }
    })
  }, [shows])

  if (movieQ.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (movieQ.isError || !movieQ.data) {
    return (
      <ErrorBanner
        message={getErrorMessage(movieQ.error, 'Movie not found')}
        onRetry={() => void movieQ.refetch()}
      />
    )
  }

  const movie = movieQ.data

  return (
    <div className="animate-fade-up space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/8">
        <div className="absolute inset-0">
          {(movie.backdropUrl || movie.imageUrl) && (
            <img
              src={movie.backdropUrl || movie.imageUrl || ''}
              alt=""
              className="h-full w-full object-cover opacity-35"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/90 to-cinema-950/40" />
        </div>
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[220px_1fr] lg:items-end">
          <div className="mx-auto w-48 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:w-56 lg:mx-0">
            {movie.imageUrl ? (
              <img src={movie.imageUrl} alt={movie.title} className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center bg-cinema-800 text-white/30">
                No poster
              </div>
            )}
          </div>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="gold">{movie.rating}</Badge>
              <Badge>{movie.genre}</Badge>
              {!movie.isActive && <Badge tone="danger">Inactive</Badge>}
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-5xl">{movie.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {movie.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-4 w-4" /> {movie.language}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-gold" /> {formatDate(movie.releaseDate)}
              </span>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
              {movie.description}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Select a show</h2>
            <p className="mt-1 text-sm text-white/50">Filter by city and date, then pick a time</p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <Select label="City" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {(citiesQ.data ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <label className="block space-y-1.5">
              <span className="text-sm text-white/70">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-cinema-900 px-3.5 py-2.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>
        </div>

        {byTheatre.length === 0 ? (
          <EmptyState
            title="No shows available"
            description="Try another city or date, or check back later."
          />
        ) : (
          <div className="space-y-4">
            {byTheatre.map((group) => (
              <div
                key={`${group.theatre}-${group.city}`}
                className="rounded-2xl border border-white/8 bg-cinema-900/60 p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{group.theatre}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                      <MapPin className="h-3.5 w-3.5" /> {group.city}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.shows.map((s) => (
                    <Link key={s.id} to={`/shows/${s.id}/seats`}>
                      <Button variant="secondary" className="min-w-[7.5rem] flex-col !items-start !py-2">
                        <span className="font-semibold">{formatTime(s.startTime)}</span>
                        <span className="text-[11px] font-normal text-white/55">
                          {formatCurrency(s.ticketPrice)} · {s.availableSeats ?? '—'} seats · {s.screen}
                        </span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
