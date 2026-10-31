# یادآور زندگی (life-reminder)

A personal, local-first PWA (Persian, RTL, Jalali calendar) for installments, plant watering and
recurring reminders. No backend: all data lives in IndexedDB on your device.

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit, persistence (fake-indexeddb) and UI tests
pnpm typecheck
BASE_PATH=/life-reminder/ pnpm build   # static output in dist/client
```

## Stack

TanStack Start (SPA mode, no SSR at runtime) · TanStack Router (file routes) · TanStack Form + Zod ·
TanStack Store · shadcn/ui (RTL) · Tailwind 4 · idb · date-fns-jalali · @daypicker/persian · vite-plugin-pwa.

## Layout

```
src/db/                 IndexedDB schema, migrations, connection, live-query hook
src/features/<name>/    schema.ts (Zod + types) · schedule.ts (pure date logic) · repository.ts · components/
src/features/notifications/  reminder-engine.ts · notification-ledger.ts · notification-service.ts
src/features/backup/    JSON export / import
src/stores/             app.store.ts (transient) · settings.store.ts (preferences)
src/routes/             pages
```

## Data and dates

- **Storage format**: calendar dates are Gregorian `YYYY-MM-DD` strings (zone-free, so changing timezone
  never moves a due day); instants are ISO datetimes. Jalali is used for display and for month arithmetic
  (installment due days, monthly reminders), clamped to the month's last day without drift.
- **Migrations**: `src/db/migrations.ts` is append-only; each entry upgrades one version inside the
  IndexedDB upgrade transaction (atomic). Never delete stores or drop records.
- **Corrupted records** are hidden from the UI, counted on the settings page, and still exported, never deleted.
- **Import** validates the whole file, downloads a backup of current data, then replaces everything in one
  transaction (all or nothing).
- The app requests persistent storage; if the browser refuses, export backups regularly.

## Notifications: limitations

There is no server, so there is no Web Push. Reminders are checked while the app is open (on start,
every minute, on tab focus, after edits). Anything missed while it was closed is shown once on next open
(more than 3 are collapsed into a summary). A delivery ledger in IndexedDB prevents duplicates across tabs.
Browsers offer no API to schedule a notification for a future time from a closed page. On iOS (16.4+),
notifications only work after "Add to Home Screen".

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/client` to GitHub Pages.
In the repo settings, set **Pages → Source: GitHub Actions**. `BASE_PATH` is derived from the repo name;
set it to `/` for a custom domain. The SPA shell is emitted as `index.html` and `404.html`, so deep links
and refreshes work, and the service worker serves it offline.
# life-reminder
