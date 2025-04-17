import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        watch: false,
        reporters: ['verbose'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/playground/**'],
    },
    plugins: [tsconfigPaths()],
})
