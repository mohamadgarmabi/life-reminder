# یادآور زندگی (life-reminder)

A personal, local-first PWA (Persian, RTL, Jalali calendar) for installments, plant watering and
recurring reminders. All data lives in IndexedDB on your device; an optional push relay gets only upcoming notification texts.

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

## Notifications

While the app is open, reminders are checked on start, every minute, on focus and after edits; anything
missed is shown once (more than 3 are collapsed into a summary). A ledger in IndexedDB prevents duplicates.

A closed PWA can't run code, so notifications on time while it's closed need the push relay in
`push-worker/` (Cloudflare Worker + D1, free tier). The app uploads its upcoming notifications (title, body,
time) whenever data or settings change; a cron sends due ones every minute via Web Push. Without
`VITE_PUSH_URL` the app works as before, open-app only. On iOS (16.4+) this only works after "Add to Home Screen".

Setup (once):

```bash
cd push-worker
npx web-push generate-vapid-keys                 # public + private key
npx wrangler d1 create life-reminder-push        # put database_id in wrangler.toml
npx wrangler d1 execute life-reminder-push --remote --file=schema.sql
# wrangler.toml: set VAPID_PUBLIC_KEY, VAPID_SUBJECT (mailto:you@…), ALLOWED_ORIGIN
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler deploy                              # prints https://life-reminder-push.<you>.workers.dev
```

Then in GitHub → Settings → Secrets and variables → Actions → **Variables**, add `PUSH_URL` (the worker URL)
and `VAPID_PUBLIC_KEY`, and redeploy. For local dev, put the same values in `.env.local` as `VITE_PUSH_URL`
and `VITE_VAPID_PUBLIC_KEY`.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/client` to GitHub Pages.
In the repo settings, set **Pages → Source: GitHub Actions**. `BASE_PATH` is derived from the repo name;
set it to `/` for a custom domain. The SPA shell is emitted as `index.html` and `404.html`, so deep links
and refreshes work, and the service worker serves it offline.

# life-reminder
