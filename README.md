# یادآور زندگی (life-reminder)

A personal, local-first PWA (Persian, RTL, Jalali calendar) for installments, plant watering and
recurring reminders, with a customizable home dashboard and a built-in games corner. All data lives in
IndexedDB on your device; an optional push relay only receives the texts of upcoming notifications.

**Live app:** <https://mohamadgarmabi.github.io/life-reminder/>

---

## معرفی

«یادآور زندگی» یک وب‌اپ نصب‌شدنی (PWA) فارسی و راست‌به‌چپ است برای کارهای تکراری زندگی روزمره: اقساطی که
باید پرداخت شوند، گل‌هایی که باید آب بخورند و یادآورهای شخصی. همه‌چیز با تقویم شمسی کار می‌کند، داده‌ها فقط روی
دستگاه خودتان ذخیره می‌شوند و بدون اینترنت هم در دسترس است.

### امکانات

- **داشبورد خانه** — ویجت‌های تاریخ، افزودن سریع، معوق، امروز، روزهای آینده و بازی‌ها؛ قابل جابه‌جایی، حذف و
  تغییر اندازه (کوچک، متوسط، بزرگ).
- **اقساط** — مبلغ، روز سررسید در ماه شمسی، تعداد کل و پرداخت‌شده، یادآوری چند روز قبل از سررسید، برچسب،
  یادداشت و تاریخچهٔ پرداخت‌ها. روز ۳۱ در ماه‌های ۳۰ روزه خودکار به آخر ماه می‌رود.
- **گیاهان** — عکس گیاه، فاصلهٔ آبیاری بر حسب روز، ثبت آبیاری با یک لمس و تاریخچهٔ آبیاری.
- **یادآورها** — یک‌بار، روزانه، هفتگی یا ماهانه؛ تعویق ۱۵ دقیقه، ۱ ساعت یا تا فردا؛ تاریخچهٔ انجام و تعویق.
- **اعلان‌ها** — هنگام باز بودن برنامه، و با سرویس push اختیاری حتی وقتی برنامه بسته است.
- **بازی‌ها** — چهارده بازی آفلاین در حالت تمام‌صفحه: ماجراجویی سه‌بعدی «جزیرهٔ فراموش‌شده»، دوندهٔ سه‌بعدی، مار، بلوک‌ریز، آجرشکن، کرم شب‌تاب،
  باران شهاب، سه‌تایی (صد مرحله)، ادغام اعداد، سودوکو (سه سطح، هر کدام هزار مرحله)، مین‌یاب، کارت حافظه،
  رنگ‌چین و چهار در یک ردیف. امتیازها روی دستگاه ذخیره می‌شوند.
- **ظاهر** — تم روشن، تیره یا هماهنگ با سیستم؛ نمای فهرستی یا شبکه‌ای؛ جلوهٔ شیشه‌ای (Liquid Glass) با
  جنس و پارامترهای قابل تنظیم؛ انیمیشن جابه‌جایی صفحه‌ها (View Transitions) قابل خاموش‌کردن.
- **پشتیبان‌گیری** — خروجی و ورودی JSON؛ پیش از جایگزینی، از داده‌های فعلی خودکار نسخهٔ پشتیبان گرفته می‌شود.
- **به‌روزرسانی** — وقتی نسخهٔ تازه منتشر شود، برنامه خبر می‌دهد و فهرست تغییرات را از روی commitها نشان می‌دهد.

### نصب روی گوشی

نشانی بالا را باز کنید و گزینهٔ «Add to Home Screen» (در iOS از دکمهٔ Share در Safari) یا «Install app»
(در Chrome/Android) را بزنید. در iOS، اعلان‌ها فقط از نسخهٔ ۱۶٫۴ به بعد و فقط پس از افزودن به صفحهٔ اصلی کار
می‌کنند.

---

## Features

| Area | What it does |
| --- | --- |
| Dashboard | Widgets for date, quick add, overdue, today, upcoming and games; reorder, hide and resize (mini / small / large). |
| Installments | Amount, Jalali due day, total and paid counts, reminders N days before, tags, notes, payment history. |
| Plants | Photo (downscaled JPEG stored as a data URL), watering interval, one-tap watering, watering history. |
| Reminders | One-off, daily, weekly or monthly; snooze (15 min, 1 h, tomorrow); completion and snooze history. |
| Notifications | In-app checks while open; optional Web Push relay for on-time delivery while closed. |
| Games | 14 offline games (The Forgotten Island 3D adventure, 3D runner, snake, blocks, breakout, firefly, meteor, match-3 with 100 levels, merge, sudoku with 3 × 1000 levels, minesweeper, memory, water sort, connect four), full-screen, local high scores. |
| Appearance | System / light / dark theme, list or grid views, adjustable Liquid Glass effect, optional page transitions. |
| Data | JSON export / import, persistent-storage request, storage usage card. |
| Updates | Prompt-based service worker update with release notes generated from recent commits. |

## Commands

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # unit, persistence (fake-indexeddb) and UI tests
pnpm typecheck      # regenerates routes, then tsc --noEmit
pnpm lint
pnpm format         # prettier --write
BASE_PATH=/life-reminder/ pnpm build   # static output in dist/client
pnpm preview        # serve dist/client
```

Requirements: Node 24 (as in CI) and pnpm (version pinned in `package.json` → `packageManager`).

## Stack

TanStack Start (SPA mode, no SSR at runtime) · TanStack Router (file routes) · TanStack Form + Zod ·
TanStack Store · tanstack-fetch · shadcn/ui on Radix (RTL) · Tailwind 4 · Motion · idb · date-fns-jalali ·
@daypicker/persian · three.js (3D game) · vite-plugin-pwa (Workbox) · React Compiler · Vitest + Testing Library.

## Layout

```
src/routes/                 file routes: /, /installments, /plants, /reminders, /settings, /games/*
src/components/<name>/      shared UI primitives (shadcn-based): index.tsx · *.styles.ts · *.types.ts · *.hook.ts
src/modules/<module>/       one folder per feature, each with the same shape:
  apis/                     data access (IndexedDB repositories, network)
  components/<name>/        module-specific components
  hooks/                    *.hook.ts — state and logic for components and views
  stores/                   TanStack Store state
  types/                    TypeScript types
  utils/                    pure logic, Zod schemas, constants (+ *.test.ts)
  views/<name>/             page-level views rendered by routes
src/test/setup.ts           Vitest setup (fake-indexeddb, DOM shims; TZ pinned to Asia/Tehran)
public/sw-notifications.js  service-worker side of notifications and push
push-worker/                optional Cloudflare Worker push relay
```

Modules:

| Module | Responsibility |
| --- | --- |
| `shell` | App shell, bottom navigation, theme script, dialogs, swipe rows, update prompt, date/number formatting |
| `database` | IndexedDB schema, append-only migrations, connection, live-query hook |
| `dashboard` | Home view, widgets, agenda (overdue / today / upcoming) |
| `installments` | Installments, payments and their Jalali schedule |
| `plants` | Plants, watering log and schedule |
| `reminders` | Reminders, recurrence, snooze and history |
| `notifications` | Reminder engine, notification ledger, push sync |
| `settings` | Settings store, backup import/export, theme, glass, transitions, storage cards |
| `games` | Game catalog, game views, boards, scores and sound effects |

Import alias: `#/…` maps to `src/…` (see `package.json` → `imports`).

## Data and dates

- **Storage format**: calendar dates are Gregorian `YYYY-MM-DD` strings (zone-free, so changing timezone
  never moves a due day); instants are ISO datetimes. Jalali is used for display and for month arithmetic
  (installment due days, monthly reminders), clamped to the month's last day without drift.
- **Recurring reminders** derive every occurrence from the first one, so monthly dates never drift;
  snoozing moves only the pending occurrence, not the schedule.
- **Uniqueness**: a payment is unique per installment and index, a watering is unique per plant and day, so
  double taps never create duplicate history.
- **Migrations**: `src/modules/database/utils/migrations.ts` is append-only; each entry upgrades one version
  inside the IndexedDB upgrade transaction (atomic). Never delete stores or drop records.
- **Corrupted records** are hidden from the UI, counted on the settings page, and still exported, never deleted.
- **Import** validates the whole file, downloads a backup of current data, then replaces everything in one
  transaction (all or nothing).
- The app requests persistent storage; if the browser refuses, export backups regularly.

## Notifications

While the app is open, reminders are checked on start, every minute, on focus and after edits; anything
missed is shown once (more than 3 are collapsed into a summary). A ledger in IndexedDB prevents duplicates.

A closed PWA can't run code, so on-time notifications while it's closed need the push relay in
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
and `VAPID_PUBLIC_KEY`, and redeploy. For local dev, put the same values in `.env.local`:

```bash
VITE_PUSH_URL=https://life-reminder-push.<you>.workers.dev
VITE_VAPID_PUBLIC_KEY=<public key>
```

### Privacy

Installments, plants, reminders, photos and settings never leave the device. With push enabled, the relay
stores only the push subscription and the title, body and time of upcoming notifications.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`: install → typecheck → test → build, then
publishes `dist/client` to GitHub Pages. In the repo settings, set **Pages → Source: GitHub Actions**.

- `BASE_PATH` is derived from the repo name; set it to `/` for a custom domain.
- The SPA shell is emitted as `index.html` and `404.html`, so deep links and refreshes work, and the
  service worker serves it offline.
- Each CI build gets version `1.0.<run number>`; bump major/minor in `package.json` by hand.
- `version.json` (not precached) carries the version and the last 50 commits; the running app compares it
  with its own commit to show "what's new". Write clear commit subjects — they become the release notes.

## Contributing

1. Keep new code in the matching `src/modules/<module>/` folders (logic in `hooks/` and `utils/`, markup in
   `components/` and `views/`).
2. Add or update `*.test.ts(x)` next to the code, then run `pnpm typecheck && pnpm test && pnpm lint`.
3. Schema changes need a new migration entry; never edit or remove existing ones.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`…).
