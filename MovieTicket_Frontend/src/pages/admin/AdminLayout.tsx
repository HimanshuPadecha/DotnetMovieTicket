import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/utils'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/movies', label: 'Movies' },
  { to: '/admin/theatres', label: 'Theatres' },
  { to: '/admin/shows', label: 'Shows' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/users', label: 'Users' },
]

export function AdminLayout() {
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-white/50">Manage catalog, showtimes, and bookings</p>
      </div>
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-white/8 bg-cinema-900/50 p-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/60 transition hover:text-white',
                isActive && 'bg-white/10 text-white',
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
