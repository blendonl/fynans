# Fynans Backend

Backend API for Fynans — a family finance management platform. Built with NestJS 11 using hexagonal (ports & adapters) architecture.

## Tech Stack

- **Framework:** NestJS 11
- **Database:** PostgreSQL + Prisma 7
- **Cache/Queue:** Redis + BullMQ
- **Auth:** better-auth (Bearer tokens, Google/Apple OAuth)
- **OCR:** PaddleOCR (receipt scanning)
- **LLM:** Ollama (receipt parsing, category suggestions)
- **Notifications:** Expo Push + Web Push (VAPID)

## Architecture

```
src/feature/{name}/
├── core/
│   ├── domain/          # Entities, value objects, repository interfaces
│   ├── application/     # Use-cases, DTOs, services
│   └── infrastructure/  # Prisma repositories, mappers
└── rest/
    ├── controllers/     # HTTP controllers
    ├── dto/             # Request/response DTOs
    └── guards/          # Route guards
```

**Key patterns:**
- Domain exceptions (`DomainNotFoundException`, etc.) mapped to HTTP by a global filter
- Request DTOs provide `toCoreDto()` for clean controller-to-service mapping
- Response DTOs use `static fromEntity()` for consistent serialization
- Cross-module communication via service facades (e.g., `FamilyService`)

## Feature Modules

| Module | Description |
|--------|-------------|
| `auth` | Authentication (better-auth, OAuth) |
| `user` | User profiles |
| `family` | Family groups, invitations, member management |
| `transaction` | Financial transactions (income/expense) |
| `expense` | Expense tracking with items |
| `income` | Income tracking |
| `basket` | Shopping basket/list with checkout-to-expense |
| `receipt` | Receipt OCR scanning and parsing |
| `ai` | AI-powered category suggestions |
| `notification` | Push + in-app notifications |
| `store` | Stores and store items |
| `item` | Product items |
| `expense-category` | Expense categories |
| `income-category` | Income categories |
| `store-item-category` | Store item categories |
| `store-item-discount` | Store item discounts |
| `payment-method` | Payment methods and balance tracking |

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Yarn 4 (via corepack)

## Setup

```bash
# From monorepo root
corepack enable
yarn install

# Configure environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database URL, secrets, etc.

# Generate Prisma client and run migrations
yarn workspace @fynans/backend prisma generate
yarn workspace @fynans/backend prisma migrate deploy

# Start development server
yarn workspace @fynans/backend start:dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `start:dev` | Start with hot reload |
| `start:debug` | Start with debugger |
| `start:prod` | Start production build |
| `build` | Compile TypeScript |
| `test` | Run unit tests |
| `test:watch` | Run tests in watch mode |
| `test:cov` | Run tests with coverage |
| `test:e2e` | Run end-to-end tests |
| `lint` | Lint and fix |
| `format` | Format with Prettier |

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth secret (min 32 chars)
- `REDIS_HOST` / `REDIS_PORT` — Redis connection
- `PADDLEOCR_SERVICE_URL` — PaddleOCR service endpoint
- `OLLAMA_SERVICE_URL` / `OLLAMA_MODEL` — Ollama LLM config
