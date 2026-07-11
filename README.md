# EN2H Booking Platform API

A REST API for managing services and customer bookings, built with **NestJS** and **TypeScript**
for the EN2H Software Engineer Intern technical assessment.

## Project Overview

The API exposes three areas of functionality:

- **Auth** — register/login with JWT access + refresh tokens.
- **Services** — CRUD for the services a business offers (authenticated / staff only).
- **Bookings** — customers create bookings without logging in; staff manage them
  (list, view, update status, cancel).

All business rules from the assignment brief are enforced at the service layer:

- A booking must belong to an existing service.
- Booking dates cannot be in the past.
- Cancelled bookings cannot be marked as completed (in fact, `CANCELLED` and `COMPLETED`
  are both treated as terminal states — see **Assumptions Made** below).
- Only authenticated users can manage services.
- Customers can create bookings without authentication.

Bonus features implemented: pagination, search + status filtering on bookings, Swagger docs,
Docker support, request validation, a global exception filter, refresh tokens, unit tests, and
duplicate-booking prevention.

## Tech Stack

- NestJS 10 + TypeScript
- TypeORM (PostgreSQL primary / SQLite for zero-install local trials)
- JWT auth via `@nestjs/jwt` + `passport-jwt`
- `class-validator` / `class-transformer` for request validation
- Swagger (`@nestjs/swagger`) for API docs
- Jest for unit tests
- Docker + Docker Compose

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v20 LTS or later (includes npm)
- [Git](https://git-scm.com/)
- Either:
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (easiest way to get PostgreSQL running), **or**
  - a local PostgreSQL installation, **or**
  - nothing extra at all if you just want to try it with SQLite (see below)

## 2. Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in real values
cp .env.example .env      # macOS/Linux
copy .env.example .env    # Windows (cmd)
# or, in PowerShell:
Copy-Item .env.example .env
```

Open `.env` and set `JWT_SECRET` / `JWT_REFRESH_SECRET` to any long random strings.

## 3. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port the API listens on | `3000` |
| `DB_TYPE` | `postgres` (preferred) or `sqlite` | `postgres` |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | Postgres connection details (used when `DB_TYPE=postgres`) | see `.env.example` |
| `SQLITE_DB_PATH` | Path to the SQLite file (used when `DB_TYPE=sqlite`) | `database.sqlite` |
| `DB_LOGGING` | Log SQL queries to the console | `false` |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Access token secret + lifetime | — / `15m` |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh token secret + lifetime | — / `7d` |

## 4. Database Setup

You have two options — pick whichever is easiest for you.

### Option A — PostgreSQL via Docker (recommended)

```bash
docker compose up -d postgres
```

This starts a local PostgreSQL instance on `localhost:5432` with the credentials already in
`.env.example`. Keep `DB_TYPE=postgres` in your `.env`.

### Option B — SQLite (zero install, quickest for a first run)

In `.env`, set:

```
DB_TYPE=sqlite
```

No further setup needed — a `database.sqlite` file is created automatically and the schema is
synced on startup. This is meant for a quick trial run only; the committed migration files
target PostgreSQL (see next section).

## 5. Running Migrations (PostgreSQL only)

With `DB_TYPE=postgres` and Postgres running:

```bash
npm run migration:run
```

This creates the `users`, `services`, and `bookings` tables (see
`src/database/migrations/1735000000000-InitSchema.ts`).

To generate a new migration after changing an entity:

```bash
npm run migration:generate -- src/database/migrations/SomeDescriptiveName
```

To roll back the last migration:

```bash
npm run migration:revert
```

> SQLite mode uses `synchronize: true` instead of migrations, since it's intended purely for a
> quick local trial run rather than a real deployment target.

## 6. Running the Application

```bash
# development, with hot reload
npm run start:dev

# production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

### Running with Docker (API + PostgreSQL together)

```bash
docker compose up --build
```

This builds the API image and starts both the API and PostgreSQL containers. Run migrations
against the containerized database with `npm run migration:run` (with `DB_HOST=localhost` in
your local `.env`, since the port is published to the host).

## 7. Running Tests

```bash
npm test          # run all unit tests
npm run test:cov  # with coverage
```

Unit tests cover `AuthService`, `ServicesService`, and `BookingsService`, including the booking
business rules (past dates, duplicate bookings, cancelled → completed transitions, etc.).

## 8. API Documentation

Two forms are provided, per the assignment's "choose one" — both are included:

- **Swagger UI**: once the app is running, visit `http://localhost:3000/api-docs`.
- **Postman Collection**: import [`postman_collection.json`](./postman_collection.json). It
  includes every endpoint with example bodies and `{{accessToken}}` / `{{refreshToken}}` /
  `{{serviceId}}` / `{{bookingId}}` variables you can fill in as you go.

### Endpoint Summary

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Log in, returns access + refresh token |
| POST | `/auth/refresh` | No (needs valid refresh token) | Exchange refresh token for a new pair |
| POST | `/auth/logout` | Yes | Invalidate the stored refresh token |
| POST | `/services` | Yes | Create a service |
| GET | `/services` | Yes | List services (paginated) |
| GET | `/services/:id` | Yes | Get a service by id |
| PATCH | `/services/:id` | Yes | Update a service |
| DELETE | `/services/:id` | Yes | Delete a service |
| POST | `/bookings` | **No** | Create a booking |
| GET | `/bookings` | Yes | List bookings (paginated, filter by `status`, `search`) |
| GET | `/bookings/:id` | Yes | Get a booking by id |
| PATCH | `/bookings/:id/status` | Yes | Update booking status |
| DELETE | `/bookings/:id` | Yes | Cancel a booking |

## 9. Assumptions Made

- **Booking visibility/management requires auth, creation doesn't.** The brief explicitly says
  customers can create bookings without logging in, but doesn't say who can view/manage them.
  Treating "list/view/update-status/cancel" as staff-only actions (same guard as Services) felt
  like the safer, more realistic interpretation for a booking platform — customers shouldn't be
  able to list *all* bookings anonymously.
- **Status transitions**: besides "cancelled can't become completed", I added a general
  transition rule so the state machine is consistent: `PENDING → CONFIRMED/CANCELLED`,
  `CONFIRMED → COMPLETED/CANCELLED`, and both `CANCELLED` and `COMPLETED` are terminal (can't be
  changed further). This is enforced in both `updateStatus` and `cancel`.
- **Duplicate booking prevention** only checks non-cancelled bookings for the same
  service/date/time — a cancelled slot can be re-booked.
- **`bookingTime`** is stored as a plain `HH:mm` string rather than a full timestamp, to keep the
  model simple and avoid timezone ambiguity, matching the flat `Booking Model` field list in the
  brief.
- **Booking `status` column** is stored as `varchar` rather than a native Postgres `enum` type,
  so the exact same entity/migration approach works unmodified against SQLite too. Correctness is
  enforced at the DTO layer with `class-validator`'s `@IsEnum`.
- Used **`bcryptjs`** instead of `bcrypt` — it's a pure-JS implementation with no native build
  step, which avoids the Windows/`node-gyp` build-tooling friction a first-time NestJS user on
  Windows would otherwise hit during `npm install`.

## 10. Future Improvements

- Role-based access control (e.g. distinguishing "staff" from "customer" accounts) instead of a
  single `User` type.
- Soft-deletes for services (so historical bookings still resolve a deleted service).
- Rate limiting on `/auth/*` and the public `POST /bookings` endpoint.
- E2E tests (Supertest) in addition to the current unit tests.
- Idempotency keys for booking creation to make client retries safe.

## Project Structure

```
src/
├── auth/            # register, login, refresh, logout, JWT strategy/guard
├── services/         # service CRUD (authenticated)
├── bookings/         # booking CRUD + business rules (mixed auth)
├── common/           # global exception filter, shared DTOs
├── config/           # TypeORM configuration
├── database/
│   ├── data-source.ts     # CLI data source for migrations
│   └── migrations/        # PostgreSQL schema migrations
├── app.module.ts
└── main.ts           # bootstrap, Swagger, global pipes/filters
```
