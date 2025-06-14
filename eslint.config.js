import { config } from '@sidekick-coder/eslint-config'
import importPlugin from 'eslint-plugin-import'

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...config,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        ignores: ['dist', 'node_modules'],
    },
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            'import/no-unresolved': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', caughtErrors: 'none' },
            ], // Ignore unused variables that start with an underscore
        },
    },
]
