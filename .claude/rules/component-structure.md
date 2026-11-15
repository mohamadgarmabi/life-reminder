---
description: Component folder layout for shared packages
paths:
  - 'packages/{design-system,form,shared-components}/**/*'
---

# Component Folder Structure

Applies to **packages only** (`design-system`, `form`, `shared-components`). Apps follow this pattern later.

## Required layout

Every component lives in its own kebab-case folder with exactly these files:

```
[component-name]/
  index.tsx
  [component-name].type.ts
  [component-name].hook.ts
  [component-name].styles.ts
```

Example — `button/`:

```
button/
  index.tsx
  button.type.ts
  button.hook.ts
  button.styles.ts
```

## File roles

| File               | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `index.tsx`        | JSX only — call the hook and render          |
| `[name].type.ts`   | Props, variants, and all TypeScript types    |
| `[name].hook.ts`   | State, effects, handlers, and derived values |
| `[name].styles.ts` | Styled parts, class maps, style tokens       |

## Rules

- Use kebab-case for folder and file prefix (`number-field/`, not `NumberField/`).
- Do not add extra files inside the component folder unless the user explicitly asks.
- If a file has nothing to export yet, keep the file with a minimal placeholder — do not skip it.
- Barrel exports from package `index.ts` re-export from each component folder.

## Example

```tsx
// button/index.tsx
import type { ButtonProps } from './button.type'
import { useButton } from './button.hook'
import { buttonStyles } from './button.styles'

const Button = (props: ButtonProps) => {
  const { className, ...rest } = useButton(props)
  return <button className={className} {...rest} />
}

export default Button
export type { ButtonProps }
```
