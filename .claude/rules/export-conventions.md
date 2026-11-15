---
description: Bottom-only exports — no inline export on declarations
---

# Export Conventions

All exports must appear **at the bottom of the file**. Never export at the point of declaration.

## Wrong

```ts
export const foo = 1
export function bar() {}
export interface Baz {}
export type Qux = string
export enum Status {}
```

## Correct

```ts
const foo = 1

const bar = () => {}

interface Baz {}

type Qux = string

enum Status {}

export default foo
export { bar, Status }
export type { Baz, Qux }
```

## Allowed export forms (bottom only)

- `export default ...`
- `export { name, otherName }`
- `export type { TypeName, OtherType }`

## Rules

- Define with `const`, `interface`, `type`, or `enum` — no `export` keyword on the declaration.
- Callables are `const name = () => {}` — never `function name()`.
- Group all exports together at the end of the file.
- Re-export barrels (`index.ts`) follow the same rule: import first, export at bottom.
- Applies to all packages and apps in this workspace.
