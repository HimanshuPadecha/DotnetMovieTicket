# How the .NET Backend Works (Simple Explanation)

This file explains the **Movie Ticket Booking System** backend in plain English.  
You do not need to be a .NET expert to understand it.

**Backend folder:** `MovieTicket_Management_System-main/`  
**Runs at:** `http://localhost:5075`  
**Swagger (API docs UI):** `http://localhost:5075/swagger`

---

## 1. What is this backend?

It is a **web API** built with **ASP.NET Core 8** (.NET).

Think of it like a restaurant kitchen:

- The **frontend** (React app) is the waiter who takes orders from customers.
- The **backend** (this .NET project) is the kitchen that does the real work.
- The **database** (SQL Server) is the pantry that stores movies, users, seats, bookings, etc.

The frontend sends HTTP requests (like “give me movies” or “book these seats”).  
The backend checks the request, talks to the database, and sends JSON back.

---

## 2. Big picture — how a request flows

```
Browser / React app
        │
        │  HTTP request (GET /movies, POST /bookings, etc.)
        ▼
   Program.cs (pipeline)
        │  1. CORS — allow frontend origin
        │  2. Authentication — check JWT if present
        │  3. Authorization — check if user is allowed
        ▼
   Controller (e.g. MoviesController)
        │  reads/writes database via TmsContext
        ▼
   SQL Server database (TMS)
        │
        ▼
   JSON response back to frontend
```

There is **no separate “services” or “repository” layer** in this project.  
Controllers talk **directly** to the database using Entity Framework (`TmsContext`).

---

## 3. Project folders — what each part means

```
MovieTicket_Management_System-main/
├── Program.cs              → App startup: JWT, CORS, DB, Swagger, seed data
├── appsettings.json        → Config: DB connection, JWT secret, CORS URLs
├── Controllers/            → API endpoints (the “doors” the frontend calls)
├── Models/                 → Database tables as C# classes
├── DTOS/                   → Shapes of data coming IN from the frontend
└── Data/DbSeeder.cs        → Creates sample users, movies, shows on first run
```

| File / folder | Plain English meaning |
|---------------|------------------------|
| `Program.cs` | “Turn on the server and wire everything together.” |
| `Controllers/*.cs` | “When someone hits this URL, do this.” |
| `Models/*.cs` | “This is what a User / Movie / Booking looks like in the DB.” |
| `DTOS/BookingDtos.cs` | “This is the JSON body we expect for login, booking, etc.” |
| `TmsContext.cs` | “The bridge between C# and SQL Server tables.” |
| `DbSeeder.cs` | “If the DB is empty, put demo data in it.” |

---

## 4. How many routes / endpoints are there?

**Total: 32 endpoints** across **7 controllers**.

There is **no** `/api` prefix. Routes look like `/movies`, `/auth/login`, etc.

### Quick count by area

| Area | Controller | Endpoints |
|------|------------|-----------|
| Home | `HomeController` | 1 |
| Auth | `AuthController` | 5 |
| Movies | `MoviesController` | 6 |
| Theatres | `TheatresController` | 7 |
| Shows | `ShowsController` | 6 |
| Bookings | `BookingsController` | 4 |
| Admin | `AdminController` | 2 |
| **Total** | | **32** |

---

## 5. All endpoints (full list)

**Auth column meaning:**

- **Public** = anyone can call it (no login)
- **Logged in** = needs a valid JWT
- **ADMIN** = needs JWT + role `ADMIN`
- **CUSTOMER/ADMIN** = needs JWT + role `CUSTOMER` or `ADMIN`

### Home (1)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| GET | `/` | Public | Tiny API overview (name, swagger link, sample logins) |

### Auth (5)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| POST | `/auth/register` | Public | Create a new customer account + return JWT |
| POST | `/auth/login` | Public | Login with email/password + return JWT |
| GET | `/auth/me` | Logged in | Who am I right now? |
| PUT | `/auth/profile` | Logged in | Change name / email |
| PUT | `/auth/password` | Logged in | Change password |

### Movies (6)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| GET | `/movies` | Public | List movies (optional filters: search, genre, language) |
| GET | `/movies/genres` | Public | List unique genres |
| GET | `/movies/{id}` | Public | One movie + its upcoming shows |
| POST | `/movies` | ADMIN | Add a movie |
| PUT | `/movies/{id}` | ADMIN | Edit a movie |
| DELETE | `/movies/{id}` | ADMIN | Soft-delete (sets `IsActive = false`, does not remove row) |

### Theatres (7)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| GET | `/theatres` | Public | List theatres (optional `city` filter) |
| GET | `/theatres/cities` | Public | List cities |
| GET | `/theatres/{id}` | Public | One theatre + its screens |
| POST | `/theatres` | ADMIN | Add a theatre |
| PUT | `/theatres/{id}` | ADMIN | Edit a theatre |
| DELETE | `/theatres/{id}` | ADMIN | Delete theatre (blocked if shows exist) |
| POST | `/theatres/screens` | ADMIN | Add a screen and auto-create seats |

### Shows (6)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| GET | `/shows` | Public | List upcoming shows (filters: movieId, city, date) |
| GET | `/shows/{id}` | Public | One show detail |
| GET | `/shows/{id}/seats` | Public | Seat map (which seats are booked) |
| POST | `/shows` | ADMIN | Create a show |
| PUT | `/shows/{id}` | ADMIN | Update show time / price |
| DELETE | `/shows/{id}` | ADMIN | Delete show (blocked if confirmed bookings exist) |

### Bookings (4)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| POST | `/bookings` | CUSTOMER or ADMIN | Book seats (`showId` + `seatNumbers`) |
| GET | `/bookings` | Logged in | My bookings (admin sees all) |
| GET | `/bookings/{id}` | Logged in | One booking (customers only see their own) |
| POST | `/bookings/{id}/cancel` | Logged in | Cancel a booking |

### Admin (2)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| GET | `/admin/dashboard` | ADMIN | Stats: users, movies, revenue, recent bookings |
| GET | `/admin/users` | ADMIN | List all users |

---

## 6. How many users are there?

### Seeded demo users (created automatically)

When the app starts the first time (empty DB), `DbSeeder.cs` creates **4 users**:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@cinema.com` | `Admin@123` | ADMIN |
| Rahul Sharma | `rahul@test.com` | `User@123` | CUSTOMER |
| Priya Patel | `priya@test.com` | `User@123` | CUSTOMER |
| Amit Kumar | `amit@test.com` | `User@123` | CUSTOMER |

So out of the box you have:

- **1 admin**
- **3 customers**
- **Total seeded users = 4**

### After that

Anyone can register via `POST /auth/register`.  
New accounts always get role **CUSTOMER**.  
So the real total in the database = **4 seeded users + however many people registered**.

### Roles (only 2)

| Role | Meaning |
|------|---------|
| `ADMIN` | Can manage movies, theatres, shows, see dashboard & all users |
| `CUSTOMER` | Can book tickets, see own bookings, edit own profile |

There is no “manager” or “staff” role in this project.

---

## 7. What else gets seeded?

Besides users, the seeder also adds sample content so the app is usable immediately:

| Thing | Count (approx.) |
|-------|-----------------|
| Roles | 2 (`ADMIN`, `CUSTOMER`) |
| Movies | 6 (Inception, Jawan, Interstellar, 3 Idiots, Dune: Part Two, Pathaan) |
| Theatres | 3 (Mumbai, Delhi, Bangalore) |
| Screens | 4 |
| Seats | Auto-generated per screen (e.g. A1–H5 style) |
| Shows | 12 |
| Sample bookings | 2 (`BK1001`, `BK1002`) |

---

## 8. Database models — what each table means

These live in `Models/`. Each class ≈ one SQL table.

```
Role ──< User ──< Booking >── Show >── Movie
                      │
                      └── BookingSeat >── Seat <── Screen <── Theatre
```

| Model | Plain English |
|-------|---------------|
| `Role` | Job title: ADMIN or CUSTOMER |
| `User` | A person who can log in |
| `Movie` | A film (title, genre, poster URLs, active/inactive) |
| `Theatre` | A cinema building (name, city, address) |
| `Screen` | A hall inside a theatre |
| `Seat` | One seat in a screen (`REGULAR` or `PREMIUM`) |
| `Show` | “This movie, in this screen, at this time, at this price” |
| `Booking` | A ticket order (code, total money, CONFIRMED/CANCELLED) |
| `BookingSeat` | Link table: which seats belong to which booking |

**Important detail:** seats marked **PREMIUM** cost **1.25×** the base ticket price when booking.

---

## 9. Controllers — which code means what

### `HomeController.cs`
Just a friendly welcome at `/`. Useful when you open the API URL in a browser.

### `AuthController.cs`
Handles register, login, profile, password, and **creates the JWT token**.  
The important private method is `BuildAuthResponse` — that is where the token is built.

### `MoviesController.cs`
Public browsing of movies + admin create/edit/soft-delete.

### `TheatresController.cs`
Public theatre list + admin CRUD.  
`POST /theatres/screens` also auto-generates seats for the new screen.

### `ShowsController.cs`
Showtimes and the **seat map** (`/shows/{id}/seats`) used by the booking UI.

### `BookingsController.cs`
The money-making path: book seats, list bookings, cancel.  
Everyone hitting these routes must be logged in (`[Authorize]` on the whole controller).

### `AdminController.cs`
Dashboard numbers and user list. Whole controller is ADMIN-only.

---

## 10. How JWT works in this .NET project (simple)

### What is JWT?

**JWT** = JSON Web Token.  
It is a signed string that proves “this person already logged in.”

After login/register, the backend gives the frontend a token.  
On later requests, the frontend sends:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If the token is valid, the backend knows who you are and what role you have.

There is **no refresh token** in this project. When the token expires, you log in again.

---

### Step A — Login / register creates a token

In `AuthController.BuildAuthResponse`:

1. Read secret settings from `appsettings.json` (`Jwt:Key`, Issuer, Audience, expiry minutes).
2. Put small facts (“claims”) inside the token:
   - Name
   - Email
   - Role (`ADMIN` or `CUSTOMER`)
   - User Id
   - A unique `jti` (token id)
3. Sign it with **HMAC-SHA256** using the secret key.
4. Set expiry (default **120 minutes**).
5. Return JSON like:

```json
{
  "token": "<long string>",
  "expiresAt": "2026-...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul@test.com",
    "role": "CUSTOMER",
    "createdAt": "..."
  }
}
```

---

### Step B — Program.cs teaches the app how to check tokens

In `Program.cs`, this line is the key idea:

```csharp
builder.Services.AddAuthentication(...).AddJwtBearer(...)
```

It tells ASP.NET:

- Expect a **Bearer** token
- Check issuer = `MovieTicketApi`
- Check audience = `MovieTicketApp`
- Check signature with `Jwt:Key`
- Check it is not expired
- Treat the role claim as `ClaimTypes.Role` (so `[Authorize(Roles = "ADMIN")]` works)

Then in the request pipeline:

```csharp
app.UseAuthentication();  // “Who is this?”
app.UseAuthorization();   // “Are they allowed?”
```

Order matters: authentication first, then authorization.

---

### Step C — Controllers lock doors with attributes

| Attribute | Meaning |
|-----------|---------|
| `[AllowAnonymous]` | Open door — no login needed |
| `[Authorize]` | Must have a valid JWT |
| `[Authorize(Roles = "ADMIN")]` | Must be logged in **and** role is ADMIN |
| `[Authorize(Roles = "CUSTOMER,ADMIN")]` | Either customer or admin |

Example from bookings:

- Whole controller: `[Authorize]` → must be logged in
- Create booking: also `[Authorize(Roles = "CUSTOMER,ADMIN")]`

If the token is missing / expired / wrong role → API returns **401** or **403**.

---

### JWT settings (from `appsettings.json`)

| Setting | Value (dev) | Meaning |
|---------|-------------|---------|
| `Jwt:Key` | long secret string | Used to sign & verify tokens |
| `Jwt:Issuer` | `MovieTicketApi` | Who created the token |
| `Jwt:Audience` | `MovieTicketApp` | Who the token is for |
| `Jwt:TokenExpiryMinutes` | `120` | Token lives 2 hours |

---

### Visual JWT flow

```
1. User posts email + password to /auth/login
2. Backend checks DB (email + password match)
3. Backend builds JWT with role + user id, signs it
4. Frontend stores token (e.g. localStorage)
5. Frontend calls /bookings with Authorization: Bearer <token>
6. UseAuthentication validates token
7. UseAuthorization checks [Authorize] / Roles
8. Controller reads user id from claims and books seats
```

---

## 11. Program.cs — what each setup block does

| Block | Plain English |
|-------|---------------|
| `AddControllers()` | Turn on MVC-style API controllers |
| `AddSwaggerGen(...)` | Build interactive API docs; allow pasting Bearer token |
| `AddAuthentication` + `AddJwtBearer` | Enable JWT login checking |
| `AddAuthorization()` | Enable `[Authorize]` attributes |
| `AddCors("Frontend")` | Allow React on localhost:5173 / 3000 to call the API |
| `AddDbContext<TmsContext>` | Connect Entity Framework to SQL Server |
| `DbSeeder.SeedAsync` | On startup, create DB + demo data if needed |
| `UseSwagger` / `UseSwaggerUI` | Show Swagger only in Development |
| `MapControllers()` | Connect URLs to controller methods |

---

## 12. Booking flow (end to end)

This is the main business path:

1. Browse movies → `GET /movies`
2. Open one movie → `GET /movies/{id}` (includes upcoming shows)
3. Pick a show → `GET /shows/{id}/seats` (see free vs booked seats)
4. Login / register → get JWT
5. Book → `POST /bookings` with `{ "showId": 1, "seatNumbers": ["A1", "A2"] }`
6. Backend checks:
   - seats exist
   - seats not already CONFIRMED for that show
   - show has not started too long ago
7. Creates booking with code like `BK...`, status `CONFIRMED`
8. Premium seats multiply price by 1.25
9. Later: `GET /bookings` or cancel with `POST /bookings/{id}/cancel`

If two people try the same seat, the second request should fail (conflict / bad request style response).

---

## 13. DTOs — why they exist

File: `DTOS/BookingDtos.cs` (despite the name, it holds DTOs for auth, movies, theatres, shows, and bookings).

**DTO** = Data Transfer Object = “the shape of JSON we accept.”

Examples:

- `LoginDTO` → email + password
- `RegisterDTO` → name + email + password
- `BookTicketsDTO` → showId + seatNumbers
- `MovieCreateDTO` → fields needed to add a movie

Controllers receive DTOs instead of full database models. That keeps the API cleaner and safer.

---

## 14. Things to know (honest notes)

These are facts about **this** project, not general .NET advice:

1. **Passwords are stored as plain text** (compared with `==`). Fine for learning / local demo; not production-safe.
2. **No refresh tokens** — after expiry, login again.
3. **No payment gateway** — booking = confirmed ticket in the app.
4. **Movie delete is soft** (`IsActive = false`).
5. **Only 2 roles:** ADMIN and CUSTOMER.
6. **Logic lives in controllers** — simple and easy to follow for beginners.

---

## 15. How to run and explore

```bash
cd MovieTicket_Management_System-main
dotnet run --launch-profile http
```

- API: http://localhost:5075  
- Swagger: http://localhost:5075/swagger  

In Swagger:

1. Call `POST /auth/login` with a seed user.
2. Copy the `token`.
3. Click **Authorize**, paste `Bearer <token>` (or just the token, depending on UI).
4. Try protected routes like `GET /auth/me` or `GET /admin/dashboard`.

---

## 16. One-page cheat sheet

| Question | Answer |
|----------|--------|
| Framework | ASP.NET Core 8 |
| Database | SQL Server via EF Core (`TmsContext`) |
| Auth | JWT Bearer (HMAC-SHA256), ~2 hours |
| Roles | `ADMIN`, `CUSTOMER` |
| Seeded users | 4 |
| Total endpoints | 32 |
| Controllers | 7 |
| Services layer? | No — controllers → DB directly |
| Frontend CORS | localhost:5173, 127.0.0.1:5173, localhost:3000 |

---

That’s the whole backend in simple terms: **controllers expose URLs, JWT proves who you are, EF saves data in SQL Server, and the seeder gives you demo movies and users so you can start booking right away.**
