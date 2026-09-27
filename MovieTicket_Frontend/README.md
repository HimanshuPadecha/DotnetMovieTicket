# CineBook — Movie Ticket Booking Frontend

React + TypeScript + Vite frontend for the Movie Ticket Booking System. Integrates with the ASP.NET Core backend in `../MovieTicket_Management_System-main`.

See [`../PROJECT.md`](../PROJECT.md) for the full product specification and API map.

## Stack

- React 19, TypeScript, Vite 8
- React Router 7
- TanStack Query
- Axios
- Tailwind CSS 4
- Lucide React

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Ensure the backend is running at the URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5075
```

### Backend

```bash
cd ../MovieTicket_Management_System-main
dotnet run --launch-profile http
```

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | rahul@test.com | User@123 |
| Admin | admin@cinema.com | Admin@123 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Oxlint |

## App routes

**Public:** `/`, `/movies`, `/movies/:id`, `/login`, `/register`

**Authenticated:** `/shows/:showId/seats`, `/bookings`, `/bookings/:id`, `/bookings/:id/confirmed`, `/profile`

**Admin:** `/admin`, `/admin/movies`, `/admin/theatres`, `/admin/shows`, `/admin/bookings`, `/admin/users`
