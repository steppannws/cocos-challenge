const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const prettierConfig = require('eslint-config-prettier');
const i18next = require('eslint-plugin-i18next');
const reactNative = require('eslint-plugin-react-native');
const reactNativeA11y = require('eslint-plugin-react-native-a11y');

module.exports = defineConfig([
  {
    ignores: [
      'node_modules/',
      'ios/',
      'android/',
      'artifacts/',
      '.claude/',
      'dist/',
      'coverage/',
      'vendor/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  i18next.configs['flat/recommended'],
  prettierConfig,
  {
    settings: { react: { version: 'detect' } },
    rules: {
      // TypeScript types the props.
      'react/prop-types': 'off',
    },
  },
  {
    // Plain JS config files run in Node.
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-native': reactNative, 'react-native-a11y': reactNativeA11y },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'uuid',
              message:
                'uuid needs crypto.getRandomValues, which Node has and devices lack: tests pass, the app breaks.',
            },
          ],
          // Co-located files may use ../ inside their screen folder; anything further goes through @/.
          patterns: [
            { group: ['../../*'], message: 'Use the @/ alias instead of ../../ imports.' },
          ],
        },
      ],
      // All HTTP goes through src/api/client.ts.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use request() from src/api/client.ts.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Use a color token from @/theme.',
        },
        {
          selector:
            "CallExpression[callee.object.name='LogBox'][callee.property.name='ignoreAllLogs']",
          message: 'LogBox.ignoreAllLogs() hides the warnings that precede crashes.',
        },
      ],
      // Styles live in styles.ts. Inline objects only for values computed at runtime.
      'react-native/no-inline-styles': 'error',
      // Every touchable needs accessibilityRole / accessibilityLabel (AGENTS.md, UI).
      ...reactNativeA11y.configs.basic.rules,
      // A label is enough; a hint on every button is noise for screen-reader users.
      'react-native-a11y/has-accessibility-hint': 'off',
    },
  },
  {
    // Split big screens into hooks/ and components; a 2,000-line navigator was unmaintainable.
    files: ['src/screens/**', 'src/components/**', 'src/navigation/**'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['src/api/**'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['src/theme/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/utils/logger.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.test.ts', 'tests/**', '*.config.*', 'scripts/**'],
    rules: { 'i18next/no-literal-string': 'off' },
  },
]);
