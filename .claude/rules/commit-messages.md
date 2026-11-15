---
description: Commit messages must be type(scope): description — never AI paragraphs
---

# Commit message format

When you write or generate a git commit message, use **one line** in this exact shape:

`type(scope): description`

## Allowed types

- `feat(${scope}): ${description}`
- `fix(${scope}): ${description}`
- `refactor(${scope}): ${description}`
- `perf(${scope}): ${description}`
- `style(${scope}): ${description}`
- `test(${scope}): ${description}`
- `docs(${scope}): ${description}`
- `build(${scope}): ${description}`
- `ops(${scope}): ${description}`
- `chore(${scope}): ${description}`
- `wip(${scope}): ${description}`
- `hotfix(${scope}): ${description}`

## Rules

- Scope is **required** (example: `pwa`, `form`, `lint`, `deps`)
- Subject is one short sentence, imperative, **no trailing period**
- No paragraphs, no bullet lists, no "and then also" essays
- Do not start with "Update", "Enhance", "Refactor" as the whole message without `type(scope):`

## Wrong

```
Update ESLint rules to enforce arrow function usage, refine TypeScript configurations for stricter checks, and enhance project documentation. Add new dependencies for improved React functionality and update .gitignore for pnpm store. Refactor various components and hooks to align with updated coding standards.
```

## Correct

```
chore(lint): enforce arrow functions and unused imports
```

```
feat(pwa): add mint home layout
```

```
build(deps): add oxc-transform-react for the compiler
```
