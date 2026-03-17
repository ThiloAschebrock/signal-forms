import { defineConfig } from 'eslint/config';
import angular from 'angular-eslint';
import oxlint from 'eslint-plugin-oxlint';

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
  oxlint.configs['flat/recommended'],
]);
