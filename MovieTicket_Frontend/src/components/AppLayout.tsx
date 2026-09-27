import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Clapperboard, LogOut, Menu, Ticket, User as UserIcon, Shield, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

export function AppLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    ...(isAuthenticated ? [{ to: '/bookings', label: 'My Bookings' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen bg-transparent text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-cinema-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/30">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span className="font-display text-lg">
              Cine<span className="text-accent-soft">Book</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white',
                    isActive && 'bg-white/10 text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 sm:flex"
                >
                  {isAdmin ? <Shield className="h-4 w-4 text-gold" /> : <UserIcon className="h-4 w-4" />}
                  {user?.name.split(' ')[0]}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-accent px-3 py-2 text-sm font-medium shadow-lg shadow-accent/25 hover:bg-accent-soft"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              type="button"
              className="rounded-lg border border-white/10 p-2 md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-white/5 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/' || item.to === '/admin'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm text-white/70',
                      isActive && 'bg-white/10 text-white',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-white/70"
                >
                  Profile
                </NavLink>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-cinema-900/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-accent" /> CineBook — Movie Ticket Booking
          </p>
          <p>Demo: rahul@test.com / User@123 · admin@cinema.com / Admin@123</p>
        </div>
      </footer>
    </div>
  )
}
