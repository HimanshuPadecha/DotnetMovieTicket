import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../api'
import { getErrorMessage } from '../../api/client'
import { Badge, EmptyState, ErrorBanner, Spinner } from '../../components/ui'
import { formatDate } from '../../lib/utils'

export function AdminUsersPage() {
  const usersQ = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.users })

  if (usersQ.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (usersQ.isError) {
    return (
      <ErrorBanner message={getErrorMessage(usersQ.error)} onRetry={() => void usersQ.refetch()} />
    )
  }

  if (!usersQ.data?.length) return <EmptyState title="No users" />

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold">Users</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/8">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cinema-800/80 text-xs uppercase text-white/45">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {usersQ.data.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-white/60">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === 'ADMIN' ? 'gold' : 'neutral'}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">{u.bookingsCount}</td>
                <td className="px-4 py-3 text-white/50">
                  {u.createdAt ? formatDate(u.createdAt) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
