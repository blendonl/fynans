# Fynans

Receipt-level expense tracking for households.

Photograph a store receipt and Fynans turns it into an itemised expense — shop,
date, products, quantities and prices — which can then be held for the rest of
the household to approve before it counts against a shared balance.

Receipt parsing is currently tuned for Kosovo store receipts printed in
Albanian, and amounts are in euro.

## What it does

- **Receipt scanning.** Guided camera capture with in-browser edge detection and
  cropping, then OCR on your own infrastructure. Only the extracted text — never
  the image — is sent to an AI model to structure the line items.
- **Household approval.** Expenses carry a `PENDING` / `CONFIRMED` / `REJECTED`
  status. Rejections keep the reason, and the submitter can fix and resubmit.
- **Personal and family scopes.** Every transaction is one or the other, and the
  dashboard and transaction list both filter on it.
- **Shared basket.** A personal and a family shopping list that becomes an
  expense at checkout, synced live over WebSockets.
- **Price history per store.** What an item cost, at which shop, over time.
- **Installable PWA** with web-push notifications.

## Repository layout

Yarn 4 workspaces, one package per app. There is no `packages/` directory.

| Path           | Package           | What it is                                                      |
| -------------- | ----------------- | --------------------------------------------------------------- |
| `apps/backend` | `@fynans/backend` | NestJS 11 API, Prisma 7 over PostgreSQL, better-auth, Socket.IO |
| `apps/web`     | `@fynans/web`     | Next.js 15 App Router, React 19, Tailwind 4, TanStack Query     |
| `apps/mobile`  | `@fynans/mobile`  | Expo 54 React Native client                                     |

The Prisma schema is split by domain across `apps/backend/prisma/schema/*.prisma`
and is wired up through `apps/backend/prisma.config.ts`.

## Prerequisites

- **Node.js 20.19+, 22.12+ or 24+** — the range Prisma 7 accepts.
- **Yarn 4** — the repo pins `yarn@4.12.0` via `packageManager`, so
  `corepack enable` is enough; do not install Yarn globally.
- **Docker** and the Compose plugin, for Postgres, Redis, MinIO and PaddleOCR.
- An **NVIDIA GPU** only if you want the bundled PaddleOCR service from
  `docker-compose.yml`, which reserves one. `docker-compose.prod.yml` builds the
  same service from `Dockerfile.cpu` instead, and you can always point
  `PADDLEOCR_SERVICE_URL` at an external instance.

## Getting started

### 1. Install dependencies

```bash
corepack enable
yarn install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

`BETTER_AUTH_SECRET` must be at least 32 characters or the backend refuses to
boot. The backend reads `.env` from its own directory first and then from the
repository root, so a single root `.env` covers both apps.

### 3. Start the services

Postgres, Redis and MinIO come from Compose. `minio-init` creates the bucket on
first run and then exits, which is expected.

```bash
docker compose up -d db redis minio minio-init
```

PaddleOCR sits behind a profile because it is large and wants a GPU:

```bash
docker compose --profile paddle up -d paddleocr
```

### 4. Create the database schema

```bash
yarn workspace @fynans/backend prisma migrate deploy
```

Use `prisma migrate dev` instead when you are changing the schema. There is no
seed script yet, so a new account starts with no expense categories — and
`Expense.categoryId` is required, so create one under **Manage** before
recording a first transaction.

### 5. Generate the API client

**The web and mobile apps will not typecheck or build until you do this.**
`apps/web/src/api/generated/` and its mobile equivalent are gitignored (see
`**/api/generated/` in `.gitignore`) and are absent from a fresh clone.

```bash
yarn api:generate
```

That builds the backend, writes `apps/backend/openapi.json` from the running
Nest metadata, and runs Orval over it to produce the typed React Query hooks and
Zod schemas for both clients. Re-run it whenever a controller or DTO changes.

### 6. Run the apps

```bash
yarn backend:dev   # http://localhost:3001, Swagger UI at /docs
yarn web:dev       # http://localhost:3000
yarn mobile:start  # Expo
```

Alternatively `docker compose up` builds and runs the backend and web images
together with the infrastructure.

## Environment variables

Copy `.env.example` to `.env`. Everything below is read from there.
`apps/backend/.env.example` carries the same backend keys for running the API on
its own.

### Required

| Variable              | Notes                                                      |
| --------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string used by Prisma and the backend  |
| `BETTER_AUTH_SECRET`  | Session signing key, **minimum 32 characters**             |
| `BETTER_AUTH_URL`     | Public origin of the backend, e.g. `http://localhost:3001` |
| `CORS_ORIGIN`         | Comma-separated list of allowed web origins                |
| `NEXT_PUBLIC_API_URL` | Backend origin the browser talks to                        |

### Database and ports

`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` seed the Compose Postgres
container. `WEB_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`, `REDIS_PORT`,
`MINIO_PORT`, `MINIO_CONSOLE_PORT` and `PADDLEOCR_PORT` remap the published
ports.

### Storage — MinIO / S3

`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`,
`MINIO_REGION`. Receipt images live here; the defaults match the Compose
service.

### Receipt processing

| Variable                  | Notes                                             |
| ------------------------- | ------------------------------------------------- |
| `OCR_ENGINE`              | `paddleocr` (default)                             |
| `PADDLEOCR_SERVICE_URL`   | OCR service origin                                |
| `PADDLEOCR_TIMEOUT`       | Milliseconds                                      |
| `RECEIPT_NORMALIZE_NAMES` | Tidy up parsed item names                         |
| `COPILOT_*`               | Credentials and model for the AI structuring step |

### Auth and notifications

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `APPLE_CLIENT_ID` /
`APPLE_CLIENT_SECRET` enable social sign-in; leave blank to disable.
`COOKIE_DOMAIN` is for sharing sessions across subdomains. `VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` sign web-push messages, with
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` as the browser-side copy.

### Web front end

| Variable                    | Notes                                                                |
| --------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | Public origin; drives canonical URLs, Open Graph, robots and sitemap |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer and legal pages; the link is hidden when unset   |

## Common commands

| Command                 | What it does                                     |
| ----------------------- | ------------------------------------------------ |
| `yarn api:generate`     | Regenerate the OpenAPI spec and both API clients |
| `yarn api:spec`         | Regenerate `apps/backend/openapi.json` only      |
| `yarn lint`             | ESLint across the repo                           |
| `yarn format`           | Prettier write                                   |
| `yarn format:check`     | Prettier check                                   |
| `yarn typecheck`        | `tsc` in every workspace                         |
| `yarn backend:test`     | Backend Jest unit tests                          |
| `yarn backend:test:e2e` | Backend end-to-end tests                         |
| `yarn web:build`        | Production build of the web app                  |
| `yarn backend:build`    | Production build of the API                      |

## Deployment

`docker-compose.prod.yml` builds `apps/backend/Dockerfile` and
`apps/web/Dockerfile`. Note that the web image bakes `NEXT_PUBLIC_API_URL` in as
a build argument, so it must be set at image build time and not only at runtime.
