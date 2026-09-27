import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Armchair, RefreshCw } from 'lucide-react'
import { bookingsApi, showsApi } from '../api'
import { getErrorMessage } from '../api/client'
import { toast } from '../components/Toast'
import { Badge, Button, ErrorBanner, Spinner } from '../components/ui'
import { formatCurrency, formatDateTime } from '../lib/utils'
import type { ApiError, SeatInfo } from '../types'

export function SeatSelectionPage() {
  const { showId } = useParams()
  const id = Number(showId)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string[]>([])

  const seatsQ = useQuery({
    queryKey: ['seats', id],
    queryFn: () => showsApi.seats(id),
    enabled: Number.isFinite(id),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const rows = useMemo(() => {
    const seats = seatsQ.data?.seats ?? []
    const map = new Map<string, SeatInfo[]>()
    for (const seat of seats) {
      const row = seat.seatNumber.replace(/\d+/g, '') || '?'
      if (!map.has(row)) map.set(row, [])
      map.get(row)!.push(seat)
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const na = Number(a.seatNumber.replace(/\D/g, ''))
        const nb = Number(b.seatNumber.replace(/\D/g, ''))
        return na - nb
      })
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [seatsQ.data])

  const total = useMemo(() => {
    if (!seatsQ.data) return 0
    const price = seatsQ.data.ticketPrice
    return selected.reduce((sum, num) => {
      const seat = seatsQ.data.seats.find((s) => s.seatNumber === num)
      return sum + price * (seat?.priceMultiplier ?? 1)
    }, 0)
  }, [selected, seatsQ.data])

  const bookM = useMutation({
    mutationFn: () => bookingsApi.create(id, selected),
    onSuccess: (booking) => {
      toast('Booking confirmed!', 'success')
      void qc.invalidateQueries({ queryKey: ['seats', id] })
      void qc.invalidateQueries({ queryKey: ['bookings'] })
      navigate(`/bookings/${booking.id}/confirmed`, { state: { booking } })
    },
    onError: (err: unknown) => {
      const apiErr = (err as { apiError?: ApiError })?.apiError
      let msg = getErrorMessage(err, 'Booking failed')
      if (apiErr?.seats?.length) msg = `${msg} (${apiErr.seats.join(', ')})`
      if (apiErr?.invalid?.length) msg = `${msg} Invalid: ${apiErr.invalid.join(', ')}`
      toast(msg, 'error')
      void seatsQ.refetch()
      setSelected([])
    },
  })

  function toggle(seat: SeatInfo) {
    if (seat.isBooked) return
    setSelected((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((s) => s !== seat.seatNumber)
        : [...prev, seat.seatNumber],
    )
  }

  if (seatsQ.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (seatsQ.isError || !seatsQ.data) {
    return (
      <ErrorBanner
        message={getErrorMessage(seatsQ.error, 'Could not load seats')}
        onRetry={() => void seatsQ.refetch()}
      />
    )
  }

  const data = seatsQ.data

  return (
    <div className="animate-fade-up grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/50">
              <Link to={`/movies/${data.movie.id}`} className="hover:text-accent-soft">
                {data.movie.title}
              </Link>
            </p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Select seats</h1>
            <p className="mt-1 text-sm text-white/55">
              {data.theatre} · {data.city} · {data.screen} · {formatDateTime(data.startTime)}
            </p>
          </div>
          <Button variant="secondary" onClick={() => void seatsQ.refetch()} type="button">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <div className="mb-8 overflow-x-auto rounded-2xl border border-white/8 bg-cinema-900/50 p-4 sm:p-6">
          <div className="mx-auto mb-8 max-w-md">
            <div className="rounded-t-full border border-white/10 bg-gradient-to-b from-white/15 to-transparent py-2 text-center text-xs tracking-[0.3em] text-white/50">
              SCREEN
            </div>
          </div>

          <div className="mx-auto flex w-max flex-col gap-2">
            {rows.map(([row, seats]) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-semibold text-white/40">{row}</span>
                <div className="flex gap-1.5">
                  {seats.map((seat) => {
                    const isSelected = selected.includes(seat.seatNumber)
                    const premium = seat.seatType === 'PREMIUM'
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={seat.isBooked}
                        onClick={() => toggle(seat)}
                        title={`${seat.seatNumber} · ${seat.seatType} · ${formatCurrency(data.ticketPrice * seat.priceMultiplier)}`}
                        aria-label={`Seat ${seat.seatNumber}${seat.isBooked ? ' booked' : ''}`}
                        className={`seat-btn flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold sm:h-9 sm:w-9 ${
                          seat.isBooked
                            ? 'cursor-not-allowed bg-cinema-700 text-white/25'
                            : isSelected
                              ? 'bg-accent text-white shadow-lg shadow-accent/40'
                              : premium
                                ? 'bg-gold/20 text-gold ring-1 ring-gold/40 hover:bg-gold/30'
                                : 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {seat.seatNumber.replace(/^[A-Z]+/i, '')}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-white/60">
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded bg-emerald-500/30 ring-1 ring-emerald-500/40" /> Available
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded bg-gold/30 ring-1 ring-gold/40" /> Premium
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded bg-accent" /> Selected
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded bg-cinema-700" /> Booked
            </span>
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-white/8 bg-cinema-900/70 p-5 lg:sticky lg:top-24">
        <div className="mb-4 flex items-center gap-2">
          <Armchair className="h-5 w-5 text-accent" />
          <h2 className="font-semibold">Booking summary</h2>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Movie</dt>
            <dd className="text-right font-medium">{data.movie.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Theatre</dt>
            <dd className="text-right">{data.theatre}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Screen</dt>
            <dd className="text-right">{data.screen}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Show</dt>
            <dd className="text-right">{formatDateTime(data.startTime)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Seats</dt>
            <dd className="text-right">
              {selected.length ? (
                <span className="flex flex-wrap justify-end gap-1">
                  {selected.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </span>
              ) : (
                'None selected'
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-base">
            <dt className="text-white/70">Total</dt>
            <dd className="font-bold text-gold">{formatCurrency(total)}</dd>
          </div>
        </dl>
        <Button
          className="mt-5 w-full"
          disabled={!selected.length || bookM.isPending}
          onClick={() => bookM.mutate()}
        >
          {bookM.isPending ? 'Booking…' : `Confirm · ${selected.length || 0} ticket(s)`}
        </Button>
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          Premium seats are charged at 1.25× base ticket price. Availability refreshes on conflict.
        </p>
      </aside>
    </div>
  )
}
