---
description: Feature module folder layout for TanStack Router apps
paths:
  - 'src/modules/**/*'
  - 'src/routes/**/*'
---

# Module Folder Structure

Applies to **TanStack Router apps only** (`@tanstack/react-router` in `package.json`).

Each feature is one module under `src/modules/[feature-name]/`.

## Required layout

```
[feature-name]/
  apis/                          # Feature API clients and endpoints
  assets/
    images/
    pdf/
    json/
  components/
    [feature-name]-header.tsx    # Feature-scoped UI (headers, sections)
  stores/
    [feature-name].store.ts      # Feature state (TanStack Store, etc.)
  hooks/
    [feature-name].hook.ts       # Feature hooks and state logic
  types/
    index.ts                     # Feature types
  utils/                         # Helpers, constants, formatters
  views/
    [route-name]-view/
      index.tsx                  # Route screen implementation
```

Example — `auth/` with `/login` and `/otp` routes:

```
auth/
  hooks/auth.hook.ts
  types/index.ts
  views/
    login-view/index.tsx
    otp-view/index.tsx
```

## Route files stay thin

`src/routes/` keeps TanStack file routes. Only wire the route to its view:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import LoginView from '#/modules/auth/views/login-view'

const LoginRoute = () => <LoginView />

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})
```

## Naming

- Module folder: kebab-case (`auth`, `trade`, `price-alert`)
- View folder: `[route-name]-view` matching the route (`login-view`, `otp-view`, `home-view`)
- Cross-feature shared UI/data: use a dedicated module (`shell`, `market`) — not `src/components/`

## Rules

- Put page JSX in `views/`, not in `routes/`
- Split logic into `hooks/`, API calls into `apis/`, types into `types/`
- View `index.tsx` files only render: no state, effects, derived values, or handler bodies
- Keep empty scaffold folders; add a minimal placeholder file when a folder has no exports yet
- Follow export conventions (exports at bottom of file)
