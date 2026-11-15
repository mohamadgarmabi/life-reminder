---
description: .tsx files render UI only — all logic lives in hooks
paths:
  - '**/*.{ts,tsx}'
---

# UI in TSX, Logic in Hooks

`.tsx` files that are **not** hooks only render. Business logic, state, effects, derived values, handlers, and view-model mapping belong in `*.hook.ts`.

## Allowed in a view/component `.tsx`

- Call one feature hook
- Return JSX
- Map over arrays the hook already prepared
- Bind handlers the hook already created (`onClick={handleSubmit}`, `onClick={item.onSelect}`)
- Static `t('key')` labels in JSX

## Not allowed in a view/component `.tsx`

- `useState` / `useEffect` (move into a `*.hook.ts` file)
- `useMemo` / `useCallback` (React Compiler memoizes automatically — do not use these)
- Derived values (`const total = price * amount`)
- Event handler bodies (`onClick={() => ...}`, `onChange={(e) => setX(e.target.value)}`)
- Data transforms, filters, `Array.from`, or view-model mapping
- Toast, navigate, API, or store calls
- Building schemas, option lists, or class-name / icon conditions from raw state
- Ternaries that pick a class, icon, or translation key

## Wrong

```tsx
const TradeView = () => {
  const { amount, side, items } = useTrade()
  const total = parseFloat(amount) * 3302

  return (
    <button
      className={side === 'buy' ? 'text-success' : 'text-danger'}
      onClick={() => toast.success(side === 'buy' ? 'Bought' : 'Sold')}
    >
      {total}
    </button>
  )
}
```

## Correct

```tsx
const TradeView = () => {
  const { total, handleSubmit, submitClassName } = useTrade()

  return (
    <button className={submitClassName} onClick={handleSubmit}>
      {total}
    </button>
  )
}
```

```ts
const useTrade = () => {
  const total = parseFloat(amount) * 3302
  const submitClassName = side === 'buy' ? 'text-success' : 'text-danger'
  const handleSubmit = () => toast.success(...)
  return { total, handleSubmit, submitClassName }
}
```

## Lists and per-item handlers

Prepare rows in the hook. Do not close over item data in the view.

```tsx
{
  quickAmounts.map((item) => (
    <button key={item.value} onClick={item.onSelect}>
      {item.label}
    </button>
  ))
}
```

## Rules

- Feature views: `views/[name]-view/index.tsx` + `hooks/[feature].hook.ts`
- Package components: `index.tsx` + `[name].hook.ts`
- `t('key')` for a static label in JSX is allowed; building lists or choosing keys by condition happens in the hook
- If a `.tsx` file needs logic, extract a hook first — do not leave it in the component
- Hook files are `*.hook.ts` — do not put JSX in them; use `createElement` when a hook must build React nodes
