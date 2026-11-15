---
description: Always use const arrow functions — never function declarations
paths:
  - '**/*.{ts,tsx,js,jsx}'
---

# Arrow Functions Only

Never declare a function with the `function` keyword. Always start with `const` and use an arrow function. ESLint errors if this is violated.

## Wrong

```ts
function useTypes() {
  return {}
}

function Button(props: ButtonProps) {
  return <button {...props} />
}

export function useLogin() {}

const load = function () {}

const api = {
  fetch() {
    return null
  },
}
```

## Correct

```ts
const useTypes = () => {
  return {}
}

const getToken = () => null

const Button = (props: ButtonProps) => {
  return <button {...props} />
}

const useLogin = () => {}

const load = async () => {}

const api = {
  fetch: () => null,
}
```

## Rules

- Components, hooks, helpers, handlers, and server functions: `const name = () => {}`
- Async: `const name = async () => {}`
- Object methods: `{ key: () => {} }` — not `{ key() {} }`
- Keep exports at the bottom of the file (`export { getToken }`, `export default Button`)
- Applies to all packages and apps in this workspace
