import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const conventions = {
  // Arrow functions only (class methods excepted, e.g. Error subclasses).
  'func-style': ['error', 'expression'],
  'prefer-arrow-callback': 'error',
  'no-restricted-syntax': [
    'error',
    { selector: 'FunctionDeclaration', message: 'Use `const name = () => {}` instead of a function declaration.' },
    {
      selector: 'FunctionExpression:not(MethodDefinition > FunctionExpression)',
      message: 'Use an arrow function (also for object members: `{ key: () => {} }`).',
    },
    {
      selector: 'ExportNamedDeclaration[declaration]',
      message: 'Export at the bottom of the file: `export { name }` / `export type { Name }`.',
    },
    {
      selector: 'ExportDefaultDeclaration > :not(Identifier)',
      message: 'Declare first, then `export default name` at the bottom of the file.',
    },
    {
      selector:
        "ImportSpecifier[imported.name=/^(useMemo|useCallback)$/], MemberExpression[object.name='React'][property.name=/^(useMemo|useCallback)$/]",
      message: 'React Compiler memoizes automatically; do not use useMemo/useCallback.',
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
  ],
}

const config = tseslint.config(
  { ignores: ['dist', 'dev-dist', 'public', 'src/routeTree.gen.ts'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  {
    files: ['**/*.{ts,tsx,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: conventions,
  },
  {
    // TanStack file routes must declare `export const Route = createFileRoute(...)`.
    files: ['src/routes/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...conventions['no-restricted-syntax']
          .slice(1)
          .filter((r) => r.selector !== 'ExportNamedDeclaration[declaration]'),
      ],
    },
  },
  prettier,
)

export default config
