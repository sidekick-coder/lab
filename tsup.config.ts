import { defineConfig } from 'tsup'
import path from 'path'

export default defineConfig({
    entry: ['src/**/**/*.ts', '!src/**/**/*.spec.ts'],
    format: 'esm',
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    splitting: true,
    clean: true,
    treeshake: true,
    external: ['fast-glob', 'yaml', 'chalk'],
    platform: 'node',
})
