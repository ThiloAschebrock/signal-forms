import { defineConfig } from 'eslint/config';
import angular from 'angular-eslint';
import oxlint from 'eslint-plugin-oxlint';

export default defineConfig([
  {
    ignores: ['.angular/**', 'dist/**', 'node_modules/**', 'coverage/**', '**/__screenshots__/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/sort-keys-in-type-decorator': 'warn',
      '@angular-eslint/prefer-service-decorator': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
  oxlint.configs['flat/recommended'],
]);
