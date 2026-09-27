import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Ticket } from 'lucide-react'
import { bookingsApi } from '../api'
import { getErrorMessage } from '../api/client'
import { Badge, Button, ErrorBanner, Spinner } from '../components/ui'
import { formatCurrency, formatDateTime, seatLabel } from '../lib/utils'
import type { Booking } from '../types'

export function BookingConfirmationPage() {
  const { id } = useParams()
  const bookingId = Number(id)
  const location = useLocation()
  const fromState = (location.state as { booking?: Booking } | null)?.booking

  const bookingQ = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.get(bookingId),
    enabled: Number.isFinite(bookingId) && !fromState,
    initialData: fromState,
  })

  if (bookingQ.isLoading && !fromState) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (bookingQ.isError || !bookingQ.data) {
    return (
      <ErrorBanner
        message={getErrorMessage(bookingQ.error, 'Booking not found')}
        onRetry={() => void bookingQ.refetch()}
      />
    )
  }

  const b = bookingQ.data

  return (
    <div className="mx-auto max-w-lg animate-fade-up">
      <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-cinema-900/80 shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600/30 to-accent/20 px-6 py-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 font-display text-3xl font-bold">Booking confirmed</h1>
          <p className="mt-2 text-sm text-white/60">Your tickets are ready. Enjoy the show!</p>
        </div>
        <div className="space-y-4 px-6 py-6">
          <div className="flex items-center justify-between rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-white/50">
              <Ticket className="h-4 w-4" /> Booking code
            </span>
            <span className="font-mono text-lg font-bold tracking-wider text-gold">{b.bookingCode}</span>
          </div>
          <dl className="space-y-3 text-sm">
            <Row label="Movie" value={b.movie} />
            <Row label="Theatre" value={`${b.theatre}, ${b.city}`} />
            <Row label="Screen" value={b.screen} />
            <Row label="Show time" value={formatDateTime(b.showTime)} />
            <Row label="Seats" value={seatLabel(b.seats)} />
            <Row label="Amount" value={formatCurrency(b.totalAmount)} />
            <div className="flex justify-between">
              <dt className="text-white/50">Status</dt>
              <dd>
                <Badge tone={b.status === 'CONFIRMED' ? 'success' : 'danger'}>{b.status}</Badge>
              </dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Link to={`/bookings/${b.id}`} className="flex-1">
              <Button className="w-full" variant="secondary">
                View ticket
              </Button>
            </Link>
            <Link to="/bookings" className="flex-1">
              <Button className="w-full">My bookings</Button>
            </Link>
          </div>
          <button
            type="button"
            className="w-full text-sm text-white/45 hover:text-white/70"
            onClick={() => window.print()}
          >
            Print this page
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
