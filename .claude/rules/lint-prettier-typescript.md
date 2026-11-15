---
description: Changes must pass Prettier, ESLint, and TypeScript
---

# Lint, Prettier, and TypeScript

Every change must be formatted and type-safe. Do not leave Prettier, ESLint, or `tsc` errors.

## Before finishing

Run on the files you touched (or the affected project):

```bash
pnpm exec prettier --write <files>
pnpm exec eslint --fix <files>
pnpm typecheck
```

Root scripts: `pnpm lint`, `pnpm format`, `pnpm format:check`, `pnpm typecheck`.

## Rules

- Follow `.prettierrc` — do not hand-format against it
- Follow `eslint.config.mjs` — treat lint errors as blockers, same as TypeScript
- `tsc` must pass (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- Unused variables and unused imports are ESLint **errors** (`@typescript-eslint/no-unused-vars`). Prefix intentionally unused names with `_`
- Only arrow functions: `const name = () => {}` — `function` declarations fail lint
- Do not use `useMemo` or `useCallback` — React Compiler memoizes automatically
- Do not use `@ts-ignore`, `@ts-expect-error`, or `any` to silence errors
- If Prettier and ESLint conflict, Prettier wins (eslint-config-prettier)
- Fix errors in the files you changed before considering the task done
