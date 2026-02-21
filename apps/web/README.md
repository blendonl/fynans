# Fynans Web

Personal finance management web application built with Next.js 15 (App Router), React 19, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 4 (managed via monorepo root)
- Backend API running (`apps/backend`)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-vapid-key>
```

### Development

```bash
# From monorepo root
yarn dev

# Or from this directory
yarn dev
```

The app runs at [http://localhost:3001](http://localhost:3001) by default.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated app shell (layout + routes)
│   └── (auth)/             # Authentication pages (login, register, callback)
├── components/             # React components organized by feature
│   ├── add-expense/        # Expense creation form components
│   ├── add-transaction/    # Shared transaction form components
│   ├── dashboard/          # Dashboard charts and widgets
│   ├── glass/              # Glassmorphism UI primitives
│   ├── layout/             # App shell (sidebar, mobile nav)
│   ├── notifications/      # Notification list and items
│   ├── profile/            # User profile and settings
│   ├── transactions/       # Transaction list and detail views
│   └── ui/                 # shadcn/ui base components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (API client, auth, date-utils, pagination)
└── providers/              # React context providers (auth, query, theme, toast, dashboard filter)
```

## Key Patterns

- **Data fetching**: React Query (`@tanstack/react-query`) for all server state — caching, pagination, optimistic updates
- **Component organization**: Feature-based folders under `src/components/`. No components in route directories.
- **UI library**: shadcn/ui components in `src/components/ui/`
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Shared types**: Imported from `@fynans/shared` workspace package
- **API client**: Type-safe generic methods (`apiClient.get<T>(...)`) in `src/lib/api-client.ts`
- **Auth**: Bearer token stored in cookies, managed by `AuthProvider`

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with Turbopack |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
