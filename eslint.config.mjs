import eslintPrettier from 'eslint-plugin-prettier/recommended';
import eslintNode from 'eslint-plugin-n';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  eslintNode.configs['flat/recommended-module'],
  eslintPrettier,
  {
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
]);
