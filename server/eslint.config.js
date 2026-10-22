import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'coverage'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      // Express error handlers need all four params even if `next` is unused
      'no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_|^next$', caughtErrors: 'none' },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: globals.jest },
  },
  // Formatting is Prettier's job; turn off the ESLint rules that would clash with it
  prettier,
];
