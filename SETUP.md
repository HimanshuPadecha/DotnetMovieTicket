# Setup & Run Guide (After Cloning)

Follow these steps on any new device after you clone this repo from GitHub.  
When finished you should have:

- Backend API → `http://localhost:5075`
- Frontend app → `http://localhost:5173`
- Swagger → `http://localhost:5075/swagger`

---

## 0. What’s in this repo

```
MTBS/
├── MovieTicket_Management_System-main/   # ASP.NET Core 8 backend
├── MovieTicket_Frontend/                  # React + Vite frontend
├── PROJECT.md                             # Product / API notes
└── SETUP.md                               # This file
```

---

## 1. Install required software

### 1.1 Git

- Windows / macOS / Linux: install Git, then confirm:

```bash
git --version
```

### 1.2 .NET 8 SDK

Install **.NET 8 SDK** (not only the runtime):

- Download: https://dotnet.microsoft.com/download/dotnet/8.0

Confirm:

```bash
dotnet --version
# should print 8.x.x
```

### 1.3 Node.js (LTS)

Install **Node.js 20+** (includes npm):

- Download: https://nodejs.org/

Confirm:

```bash
node -v
npm -v
```

### 1.4 SQL Server

The backend needs **SQL Server** reachable with the connection string you configure.

**Option A — Docker (recommended on most machines)**

1. Install Docker Desktop / Docker Engine.
2. Start a SQL Server container:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrongPassword123!" \
  -p 1433:1433 --name mtbs-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

Wait ~20–40 seconds for SQL to become ready.

**Option B — Local SQL Server**

Install SQL Server / SQL Server Express and note:

- Server name (example: `localhost,1433` or `localhost\\SQLEXPRESS`)
- SA or SQL login + password

---

## 2. Clone the project

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd MTBS
```

(Use whatever folder name GitHub gives you after clone.)

---

## 3. Configure environment files (important)

Secrets and machine-specific URLs are **not** meant to be committed as live `.env` / local Development settings.

### 3.1 Frontend env

```bash
cd MovieTicket_Frontend
cp .env.example .env
```

Edit `.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:5075
```

Rules:

| File | Commit to Git? | Purpose |
|------|----------------|---------|
| `.env.example` | ✅ Yes | Template for everyone |
| `.env` | ❌ No | Your local values only |

If the API runs on another host/port, change `VITE_API_BASE_URL` to match.

### 3.2 Backend env / settings

```bash
cd ../MovieTicket_Management_System-main
cp appsettings.Development.json.example appsettings.Development.json
```

Open `appsettings.Development.json` and set your SQL password / server to match your machine:

```json
{
  "ConnectionStrings": {
    "CS": "Server=localhost,1433;Database=TMS;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "MovieTicketBooking_SuperSecretKey_2026_Min32Chars!",
    "Issuer": "MovieTicketApi",
    "Audience": "MovieTicketApp",
    "TokenExpiryMinutes": 120
  },
  "Cors": {
    "Origins": [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000"
    ]
  }
}
```

Rules:

| File | Commit to Git? | Purpose |
|------|----------------|---------|
| `appsettings.json` | ✅ Yes | Shared defaults |
| `appsettings.Development.json.example` | ✅ Yes | Template |
| `appsettings.Development.json` | ❌ No | Your local DB / JWT overrides |

Notes:

- `Jwt:Key` must be **at least 32 characters**.
- If frontend is not on `5173`, add that origin under `Cors:Origins`.
- On first API start, EF creates/seeds the `TMS` database automatically (if SQL is reachable).

---

## 4. Install packages

### 4.1 Backend NuGet packages

```bash
cd MovieTicket_Management_System-main
dotnet restore
dotnet build
```

If `dotnet restore` fails with NuGet network errors, fix internet/proxy/DNS and retry.

### 4.2 Frontend npm packages

```bash
cd ../MovieTicket_Frontend
npm install
```

---

## 5. Run the project (two terminals)

### Terminal 1 — Backend

```bash
cd MovieTicket_Management_System-main
dotnet run --launch-profile http
```

Wait until you see something like:

```text
Now listening on: http://localhost:5075
```

Quick check:

```bash
curl http://localhost:5075/
# or open http://localhost:5075/swagger
```

### Terminal 2 — Frontend

```bash
cd MovieTicket_Frontend
npm run dev
```

Open: **http://localhost:5173**

---

## 6. Demo logins (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cinema.com` | `Admin@123` |
| Customer | `rahul@test.com` | `User@123` |

---

## 7. Verify it works (checklist)

1. Home page loads movies from the API  
2. Open a movie → shows appear  
3. Login as customer  
4. Select seats → confirm booking  
5. See booking under **My Bookings**  
6. Login as admin → `/admin` dashboard loads  
7. Logout works; protected pages redirect to login  

Useful commands:

```bash
# Frontend production build (optional)
cd MovieTicket_Frontend
npm run build

# Backend build
cd MovieTicket_Management_System-main
dotnet build
```

---

## 8. Common problems & fixes

### SQL connection failed / API crashes on start

- SQL container/service not running  
- Wrong password in `appsettings.Development.json`  
- Port `1433` blocked or already used  

Test Docker SQL:

```bash
docker ps
docker start mtbs-sql
```

### CORS error in browser

- Frontend origin not listed in `Cors:Origins`  
- Restart backend after changing CORS  

### Frontend cannot reach API

- Backend not running on `5075`  
- Wrong `VITE_API_BASE_URL` in `.env`  
- Restart `npm run dev` after changing `.env` (Vite reads env at startup)

### `dotnet restore` NU1301 / NuGet unavailable

- Temporary network issue to `api.nuget.org`  
- Retry later, or configure NuGet proxy if behind a corporate firewall  

### Port already in use

- Change backend URL via:

```bash
ASPNETCORE_URLS=http://localhost:5080 dotnet run
```

Then set frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5080
```

---

## 9. What to push / not push to GitHub

**Do push**

- Source code  
- `.env.example`  
- `appsettings.Development.json.example`  
- `SETUP.md`, `PROJECT.md`  

**Do not push**

- `MovieTicket_Frontend/.env`  
- `MovieTicket_Frontend/node_modules/`  
- `MovieTicket_Management_System-main/appsettings.Development.json` (local secrets)  
- `bin/`, `obj/`, `dist/`  

Before first push, confirm:

```bash
# from repo root
git status
# .env and appsettings.Development.json should NOT appear as tracked files
```

---

## 10. Short “already set up” cheat sheet

```bash
# 1) SQL (Docker)
docker start mtbs-sql   # or docker run ... (see step 1.4)

# 2) Backend
cd MovieTicket_Management_System-main
# first time only: cp appsettings.Development.json.example appsettings.Development.json
dotnet run --launch-profile http

# 3) Frontend (new terminal)
cd MovieTicket_Frontend
# first time only: cp .env.example .env && npm install
npm run dev
```

Open http://localhost:5173
