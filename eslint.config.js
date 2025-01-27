import { config } from '@sidekick-coder/eslint-config'
import importPlugin from 'eslint-plugin-import'

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...config,
    importPlugin.flatConfigs.recommended,
    {
        rules: {
            'linebreak-style': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
]
