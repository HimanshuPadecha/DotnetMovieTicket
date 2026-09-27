import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../api'
import { getErrorMessage } from '../../api/client'
import { toast } from '../../components/Toast'
import { Badge, Button, EmptyState, ErrorBanner, Select, Spinner } from '../../components/ui'
import { formatCurrency, formatDateTime, seatLabel } from '../../lib/utils'
import { useState } from 'react'

export function AdminBookingsPage() {
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const bookingsQ = useQuery({
    queryKey: ['bookings', status || 'all'],
    queryFn: () => bookingsApi.list(status || undefined),
  })

  const cancelM = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: (res) => {
      toast(res.message || 'Cancelled', 'success')
      void qc.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Bookings</h2>
        <div className="w-48">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      {bookingsQ.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {bookingsQ.isError && (
        <ErrorBanner message={getErrorMessage(bookingsQ.error)} onRetry={() => void bookingsQ.refetch()} />
      )}
      {!bookingsQ.isLoading && !bookingsQ.data?.length && <EmptyState title="No bookings" />}

      {!!bookingsQ.data?.length && (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cinema-800/80 text-xs uppercase text-white/45">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Show</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingsQ.data.map((b) => (
                <tr key={b.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <Link to={`/bookings/${b.id}`} className="font-mono text-gold hover:underline">
                      {b.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/60">{b.customer?.name ?? '—'}</td>
                  <td className="px-4 py-3">{b.movie}</td>
                  <td className="px-4 py-3 text-white/60">{formatDateTime(b.showTime)}</td>
                  <td className="px-4 py-3 text-white/60">{seatLabel(b.seats)}</td>
                  <td className="px-4 py-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={b.status === 'CONFIRMED' ? 'success' : 'danger'}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'CONFIRMED' && new Date(b.showTime).getTime() > Date.now() && (
                      <Button
                        variant="danger"
                        className="!px-2 !py-1 text-xs"
                        disabled={cancelM.isPending}
                        onClick={() => {
                          if (confirm(`Cancel ${b.bookingCode}?`)) cancelM.mutate(b.id)
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
