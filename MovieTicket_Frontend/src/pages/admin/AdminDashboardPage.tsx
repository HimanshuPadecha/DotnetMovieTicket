import { useQuery } from '@tanstack/react-query'
import { Clapperboard, Film, IndianRupee, Ticket, Users, Building2 } from 'lucide-react'
import { adminApi } from '../../api'
import { getErrorMessage } from '../../api/client'
import { Badge, ErrorBanner, Spinner } from '../../components/ui'
import { formatCurrency, formatDateTime } from '../../lib/utils'

export function AdminDashboardPage() {
  const dashQ = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard })

  if (dashQ.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (dashQ.isError || !dashQ.data) {
    return (
      <ErrorBanner message={getErrorMessage(dashQ.error)} onRetry={() => void dashQ.refetch()} />
    )
  }

  const d = dashQ.data
  const cards = [
    { label: 'Movies', value: d.totalMovies, icon: Film },
    { label: 'Theatres', value: d.totalTheatres, icon: Building2 },
    { label: 'Upcoming shows', value: d.totalShows, icon: Clapperboard },
    { label: 'Users', value: d.totalUsers, icon: Users },
    { label: 'Confirmed', value: d.confirmedBookings, icon: Ticket },
    { label: 'Revenue', value: formatCurrency(d.revenue), icon: IndianRupee },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/8 bg-cinema-900/60 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50">{c.label}</p>
              <c.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Recent bookings</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cinema-800/80 text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {d.recentBookings.map((b) => (
                <tr key={b.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-gold">{b.bookingCode}</td>
                  <td className="px-4 py-3">{b.customer}</td>
                  <td className="px-4 py-3">{b.movie}</td>
                  <td className="px-4 py-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={b.status === 'CONFIRMED' ? 'success' : 'danger'}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/50">{formatDateTime(b.bookedAt)}</td>
                </tr>
              ))}
              {!d.recentBookings.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-white/35">Cancelled bookings: {d.cancelledBookings}</p>
      </section>
    </div>
  )
}
