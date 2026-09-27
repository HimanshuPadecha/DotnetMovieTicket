# Movie Ticket Booking System (MTBS)

Production-quality React frontend integrated with the existing ASP.NET Core backend for end-to-end movie ticket booking.

---

## 1. Primary objective

Build a complete modern Movie Ticket Booking System frontend using React and connect it to the existing .NET backend.

The application must be:

- Fully functional and end-to-end connected to real APIs
- Visually polished (dark cinematic theme)
- Responsive, fast, maintainable, and type-safe where practical
- Authentication-aware and authorization-aware
- Error-resistant with loading / empty / error states
- Production-quality and easy to extend

**Definition of done:** the app runs, the frontend talks to the real backend, auth works, authorization works, booking works, error states work, responsive UI works, and the production build succeeds.

Do **not** invent API contracts. Inspect controllers, DTOs, Swagger, and `appsettings` first; adapt the frontend to the backend.

---

## 2. Repository layout

| Path | Role |
|------|------|
| `SETUP.md` | Step-by-step install & run guide after cloning |
| `MovieTicket_Management_System-main/` | ASP.NET Core 8 backend (API + JWT + EF Core + SQL Server) |
| `MovieTicket_Frontend/` | React + TypeScript + Vite frontend |

---

## 3. Technology stack

### Backend (existing)

- ASP.NET Core / .NET 8
- Entity Framework Core + SQL Server
- JWT Bearer authentication
- Swagger / OpenAPI (Development)
- CORS policy `Frontend` for Vite origins

### Frontend (target)

- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios (centralized API client)
- TanStack Query (server state where valuable)
- Lucide React (icons)

Prefer simple, maintainable architecture over excess abstraction. Preserve useful existing frontend decisions.

---

## 4. Backend API map (inspected — do not invent)

Base URL (dev): `http://localhost:5075`  
Swagger (dev): `http://localhost:5075/swagger`

### Auth — `/auth`

| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| POST | `/auth/register` | Public | Returns JWT + user; role `CUSTOMER` |
| POST | `/auth/login` | Public | Returns JWT + user |
| GET | `/auth/me` | Bearer | Current user |
| PUT | `/auth/profile` | Bearer | Update name/email |
| PUT | `/auth/password` | Bearer | Change password |

**Auth response shape (actual):**

```json
{
  "token": "<jwt>",
  "expiresAt": "<utc>",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "...",
    "email": "...",
    "role": "CUSTOMER | ADMIN",
    "createdAt": "..."
  }
}
```

Send authenticated requests as: `Authorization: Bearer <token>`  
No refresh-token flow exists — do not invent one.

### Movies — `/movies`

| Method | Route | Auth |
|--------|-------|------|
| GET | `/movies` | Public (query: search, genre, language, includeInactive) |
| GET | `/movies/genres` | Public |
| GET | `/movies/{id}` | Public |
| POST | `/movies` | ADMIN |
| PUT | `/movies/{id}` | ADMIN |
| DELETE | `/movies/{id}` | ADMIN |

### Theatres — `/theatres`

| Method | Route | Auth |
|--------|-------|------|
| GET | `/theatres` | Public (query: city) |
| GET | `/theatres/cities` | Public |
| GET | `/theatres/{id}` | Public |
| POST | `/theatres` | ADMIN |
| PUT | `/theatres/{id}` | ADMIN |
| DELETE | `/theatres/{id}` | ADMIN |
| POST | `/theatres/screens` | ADMIN |

### Shows — `/shows`

| Method | Route | Auth |
|--------|-------|------|
| GET | `/shows` | Public (query: movieId, city, date) |
| GET | `/shows/{id}` | Public |
| GET | `/shows/{id}/seats` | Public (seat map + booking status) |
| POST | `/shows` | ADMIN |
| PUT | `/shows/{id}` | ADMIN |
| DELETE | `/shows/{id}` | ADMIN |

### Bookings — `/bookings`

| Method | Route | Auth |
|--------|-------|------|
| POST | `/bookings` | CUSTOMER, ADMIN — body `{ showId, seatNumbers }` |
| GET | `/bookings` | Authenticated (query: status) |
| GET | `/bookings/{id}` | Authenticated |
| POST | `/bookings/{id}/cancel` | Authenticated |

### Admin — `/admin` (role `ADMIN` only)

| Method | Route | Auth |
|--------|-------|------|
| GET | `/admin/dashboard` | ADMIN |
| GET | `/admin/users` | ADMIN |

### Roles (actual)

- `CUSTOMER`
- `ADMIN`

### JWT / CORS (from `appsettings.json`)

- Issuer: `MovieTicketApi`
- Audience: `MovieTicketApp`
- Expiry: `TokenExpiryMinutes` (default 120)
- Allowed origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`

Errors typically return JSON like `{ message: "..." }` (and sometimes seat conflict details). Prefer adapting the frontend to these responses.

---

## 5. UI / UX direction

Premium commercial movie-booking feel:

- Dark cinematic theme
- Strong hierarchy, large posters/backdrops
- Clean typography, excellent spacing
- Subtle animations / smooth transitions
- Clear CTAs, professional forms
- Skeleton loaders, empty states, error states, toasts
- Mobile-first responsiveness
- Accessible interactions (labels, focus, keyboard)

Not a generic CRUD dashboard on the customer side.

---

## 6. Required customer flows

Implement only what the backend supports (all of the following are supported):

1. **Home** — hero, current/upcoming movies, search, genre filter, movie cards, booking CTA  
2. **Movie details** — poster, backdrop, title, description, genre, duration, language, release date, rating, related shows  
3. **Show selection** — date, city, theatre, showtime → seat selection  
4. **Seat selection** — layout from `/shows/{id}/seats`; available / selected / booked; seat types & pricing; totals; no hardcoded layouts when API provides seats  
5. **Booking summary** — movie, theatre, screen, date/time, seats, price breakdown  
6. **Booking** — real `POST /bookings`; handle success, 400/401/409 conflicts, network/server errors  
7. **Confirmation** — booking code/reference, details, link to history  
8. **My bookings** — list, detail, cancel if allowed, status  
9. **Profile** — view/update profile, change password, logout  

---

## 7. Authentication & authorization

### Auth architecture

- Centralized auth context / token storage
- Attach Bearer token on API client
- Handle 401 → clear session + redirect to login
- Persist token per the app security model (respect expiry)
- Protected routes for booking, seats, bookings, profile
- Role-protected routes for admin

### Route groups (conceptual)

**Public:** `/`, `/movies`, `/movies/:id`, `/login`, `/register`  

**Authenticated:** seat selection, booking confirm, `/bookings`, `/bookings/:id`, `/profile`  

**Admin (`ADMIN`):** `/admin`, movies/theatres/shows management, users, dashboard  

Frontend route guards are UX only; backend `[Authorize]` remains the real security boundary.

---

## 8. Admin panel

Build only against real admin-capable APIs:

- Dashboard (`/admin/dashboard`)
- Users (`/admin/users`)
- Movies / Theatres / Screens / Shows CRUD (admin endpoints on those controllers)
- Bookings visibility via booking APIs where role allows

Use tables, search/filter, forms, confirmations, loading and error handling. No fake local-state CRUD.

---

## 9. Frontend architecture

```
MovieTicket_Frontend/src/
  api/           # Axios client + domain modules (auth, movies, shows, theatres, bookings, admin)
  types/         # Shared TypeScript contracts matching backend responses
  context/       # Auth (and toast if needed)
  components/    # Layout, protected routes, shared UI, movie cards, etc.
  pages/         # Route-level screens (customer + admin)
  lib/           # Small helpers (cn, formatters, error parsing)
```

### API layer rules

- Single base URL from env (`VITE_API_BASE_URL`)
- Central auth headers, request/response/error handling
- No raw URLs scattered in components
- Never hardcode secrets or backend credentials in the client

### Server state

- TanStack Query for lists/details with sensible caching
- Seat availability and booking: prioritize correctness — short/no stale cache, refetch before confirm

---

## 10. Error handling & forms

Handle gracefully: 400, 401, 403, 404, 409 (seat conflicts), 429, 500, network, timeout, invalid JSON, expired auth.

- User-friendly messages; no stack traces in UI
- Validate forms on the client for UX; backend remains final authority
- Surface backend `message` (and conflict seat lists when present)

Every async screen needs loading, empty, and error UI.

---

## 11. Environment configuration

Frontend example (`.env` / `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5075
```

Backend (local): SQL Server connection string + JWT settings in `appsettings.json` / Development overrides. Do not commit real production secrets.

---

## 12. Run commands

### Backend

```bash
cd MovieTicket_Management_System-main
dotnet run --launch-profile http
# API: http://localhost:5075  |  Swagger: /swagger
```

Requires SQL Server reachable per `ConnectionStrings:CS`.

### Frontend

```bash
cd MovieTicket_Frontend
cp .env.example .env   # if needed
npm install
npm run dev            # http://localhost:5173
npm run build          # production build must succeed
```

---

## 13. End-to-end QA checklist

- [ ] Frontend starts; production build succeeds; no TS / broken imports
- [ ] Backend connection works (CORS + base URL)
- [ ] Register / login / JWT attached / logout / refresh keeps session correctly
- [ ] Protected + admin routes respect roles
- [ ] Movies, theatres, shows, seats, booking, booking history work against real APIs
- [ ] Seat conflicts (409) and other errors show clear UI
- [ ] Loading / empty / error / responsive layouts work
- [ ] No mocked “success” paths, no secrets in client env beyond public base URL
- [ ] Direct URL navigation and mobile layouts work

### User journey smoke test

1. Open app → home loads movies from API  
2. Movie details → show selection → seats from API  
3. Register / login → JWT used on booking  
4. Confirm booking → confirmation + appears in My Bookings  
5. Cancel (if allowed) → logout → protected routes redirect  
6. Admin login → dashboard / CRUD against real endpoints  

---

## 14. Agent / engineering priorities

1. Backend understanding (controllers → responses)  
2. API integration  
3. Authentication / JWT  
4. Core booking flow  
5. Error handling  
6. Admin functionality  
7. UI polish  
8. Performance (lazy routes, image care — no premature micro-opts)  
9. Final QA  

**Loop:** inspect → implement → run → test → debug → fix → re-test until definition of done.

Do not hide errors with permanent mocks, `any` everywhere, disabled TS, or bypassed auth.

---

## 15. Current frontend status

`MovieTicket_Frontend` is a full CineBook customer + admin app:

- Dark cinematic UI, responsive layout, toasts, skeletons, empty/error states
- Customer: Home, Movies, Movie detail + show picker, Seat map, Booking confirm, My bookings, Profile, Auth
- Admin: Dashboard, Movies/Theatres/Screens/Shows CRUD, Bookings, Users
- Central Axios API layer + TanStack Query + JWT auth (`mt_token`) + role-protected routes
- Production build succeeds (`npm run build`)

Treat this document as the product source of truth; keep frontend contracts aligned with backend controllers.

---

## 16. Known backend constraints

- Roles are only `CUSTOMER` and `ADMIN` (no manager/staff roles)
- No refresh tokens
- No dedicated payment gateway endpoints (booking confirms ticket purchase in-app)
- Admin user list + dashboard stats exist; deeper user management beyond listed routes is not present
- Seat layout comes from show seat endpoint — frontend must render what the API returns

If a required UX depends on a missing API, document the gap instead of faking it.
