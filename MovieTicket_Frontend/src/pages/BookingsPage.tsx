import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '../api'
import { getErrorMessage } from '../api/client'
import { Badge, Button, EmptyState, ErrorBanner, PageHeader, Spinner } from '../components/ui'
import { formatCurrency, formatDateTime, seatLabel } from '../lib/utils'

export function BookingsPage() {
  const bookingsQ = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.list(),
  })

  const now = Date.now()
  const list = bookingsQ.data ?? []
  const upcoming = list.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.showTime).getTime() >= now,
  )
  const past = list.filter(
    (b) => b.status !== 'CONFIRMED' || new Date(b.showTime).getTime() < now,
  )

  return (
    <div className="animate-fade-up">
      <PageHeader title="My bookings" subtitle="Upcoming tickets and past history." />

      {bookingsQ.isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {bookingsQ.isError && (
        <ErrorBanner
          message={getErrorMessage(bookingsQ.error)}
          onRetry={() => void bookingsQ.refetch()}
        />
      )}

      {!bookingsQ.isLoading && !list.length && (
        <EmptyState
          title="No bookings yet"
          description="Browse movies and reserve your seats."
          action={
            <Link to="/movies">
              <Button>Browse movies</Button>
            </Link>
          }
        />
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-bold">Upcoming</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((b) => (
              <BookingCard key={b.id} id={b.id} movie={b.movie} imageUrl={b.imageUrl} theatre={b.theatre} city={b.city} showTime={b.showTime} seats={b.seats} totalAmount={b.totalAmount} status={b.status} bookingCode={b.bookingCode} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">Past & cancelled</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((b) => (
              <BookingCard key={b.id} id={b.id} movie={b.movie} imageUrl={b.imageUrl} theatre={b.theatre} city={b.city} showTime={b.showTime} seats={b.seats} totalAmount={b.totalAmount} status={b.status} bookingCode={b.bookingCode} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BookingCard(props: {
  id: number
  bookingCode: string
  movie: string
  imageUrl?: string | null
  theatre: string
  city: string
  showTime: string
  seats: string[] | { seatNumber: string }[]
  totalAmount: number
  status: string
}) {
  return (
    <Link
      to={`/bookings/${props.id}`}
      className="flex gap-4 overflow-hidden rounded-2xl border border-white/8 bg-cinema-900/60 transition hover:border-accent/40"
    >
      <div className="hidden w-24 shrink-0 bg-cinema-800 sm:block">
        {props.imageUrl ? (
          <img src={props.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/30">Poster</div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center py-4 pr-4 pl-4 sm:pl-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{props.movie}</h3>
          <Badge tone={props.status === 'CONFIRMED' ? 'success' : 'danger'}>{props.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-white/55">
          {props.theatre}, {props.city}
        </p>
        <p className="mt-1 text-sm text-white/55">{formatDateTime(props.showTime)}</p>
        <p className="mt-2 text-xs text-white/40">
          {props.bookingCode} · {seatLabel(props.seats)} · {formatCurrency(props.totalAmount)}
        </p>
      </div>
    </Link>
  )
}
