import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../api'
import { getErrorMessage } from '../api/client'
import { toast } from '../components/Toast'
import { Badge, Button, ErrorBanner, Spinner } from '../components/ui'
import { formatCurrency, formatDateTime, seatLabel } from '../lib/utils'

export function BookingDetailPage() {
  const { id } = useParams()
  const bookingId = Number(id)
  const qc = useQueryClient()

  const bookingQ = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.get(bookingId),
    enabled: Number.isFinite(bookingId),
  })

  const cancelM = useMutation({
    mutationFn: () => bookingsApi.cancel(bookingId),
    onSuccess: (res) => {
      toast(res.message || 'Booking cancelled', 'success')
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] })
      void qc.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  if (bookingQ.isLoading) {
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
  const canCancel = b.status === 'CONFIRMED' && new Date(b.showTime).getTime() > Date.now()

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Link to="/bookings" className="text-sm text-white/50 hover:text-accent-soft">
        ← Back to bookings
      </Link>
      <div className="mt-4 overflow-hidden rounded-3xl border border-white/8 bg-cinema-900/70">
        {(b.imageUrl || ('backdropUrl' in b && (b as { backdropUrl?: string }).backdropUrl)) && (
          <div className="relative h-40 bg-cinema-800">
            <img
              src={
                (b as { backdropUrl?: string }).backdropUrl || b.imageUrl || ''
              }
              alt=""
              className="h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 to-transparent" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-gold">{b.bookingCode}</p>
              <h1 className="mt-1 font-display text-3xl font-bold">{b.movie}</h1>
            </div>
            <Badge tone={b.status === 'CONFIRMED' ? 'success' : 'danger'}>{b.status}</Badge>
          </div>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field label="Theatre" value={`${b.theatre}, ${b.city}`} />
            <Field label="Screen" value={b.screen} />
            <Field label="Show time" value={formatDateTime(b.showTime)} />
            <Field label="Booked at" value={formatDateTime(b.bookedAt)} />
            <Field label="Seats" value={seatLabel(b.seats)} />
            <Field label="Total" value={formatCurrency(b.totalAmount)} />
            {b.customer && (
              <Field label="Customer" value={`${b.customer.name} (${b.customer.email})`} />
            )}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            {canCancel && (
              <Button
                variant="danger"
                disabled={cancelM.isPending}
                onClick={() => {
                  if (confirm('Cancel this booking? Seats will be released.')) cancelM.mutate()
                }}
              >
                {cancelM.isPending ? 'Cancelling…' : 'Cancel booking'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
