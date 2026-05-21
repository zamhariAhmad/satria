# Satria

Mobile-first web app for monitoring student (santri) payments in a pesantren.

This repository hosts the **frontend** built with Next.js. The backend API is owned by a separate team. Until that API is ready, a full mock layer (MSW) serves realistic data.

See [`PRD.md`](./PRD.md) for the full product requirements document.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (green-dominant theme)
- TanStack Query (server state) + Zustand (UI state)
- React Hook Form + Zod
- MSW (Mock Service Worker) for the mock API layer
- Inter font via `next/font/google`
- Firebase Cloud Messaging (push notifications, integration phase)

## Getting started

```bash
npm install
npm run msw:init           # generates public/mockServiceWorker.js
npm run dev
```

App runs at http://localhost:3000 with mocks enabled by default
(`NEXT_PUBLIC_USE_MOCK=true` in `.env.local`).

## Project structure

```
src/
  app/                      # routes (App Router)
    (app)/                  # authenticated mobile shell
      dashboard/
      bills/
      history/
      profile/
      notifications/
  components/
    ui/                     # shadcn primitives
    common/                 # PageHeader, BottomNav, TopBar, StatCard…
  features/
    auth/
    bill/
    payment/
    student/
    dashboard/
    notification/
  lib/                      # api, query-client, format helpers
  providers/                # QueryProvider, MockProvider, auth store
  config/                   # brand, env, routes
  mocks/                    # MSW handlers, factories, seed
```

## Mocks

Toggle with `NEXT_PUBLIC_USE_MOCK`. When the real backend is ready, set it to
`false` and update `NEXT_PUBLIC_API_BASE_URL`. Schemas live next to each
feature so mocks and real responses validate against the same Zod definitions.

## Mobile-first

Layout is designed for 360–414px width. A bottom navigation bar appears on
mobile and is hidden from `md:` upward. Safe-area insets are respected for
notched devices.
