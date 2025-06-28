import { defineConfig } from 'tsup'
import { dirname, relative, resolve } from 'path'
import fg from 'fast-glob'
import fs from 'fs'

export default defineConfig({
    tsconfig: resolve(__dirname, 'tsconfig.json'),
    entry: ['src/**/**/*.ts', '!src/**/**/*.spec.ts'],
    external: ['fast-glob', 'yaml', 'chalk'],
    format: 'esm',
    platform: 'node',
    splitting: false,
    clean: true,
    treeshake: false,
    sourcemap: false,
    minify: false,
    skipNodeModulesBundle: true,
    bundle: false,
    async onSuccess() {
        // fix alias
        const files = await fg('dist/**/*.js', { onlyFiles: true })
        const alias: Record<string, string> = {}

        for (const folder of fs.readdirSync(resolve('dist'))) {
            alias[`@/${folder}`] = resolve('dist', folder)
        }

        for (const file of files.reverse()) {
            const folder = dirname(file)
            let content = await fs.promises.readFile(file, 'utf-8')

            for (const [key, value] of Object.entries(alias)) {
                let importPath = relative(folder, value).replace(/\\/g, '/')

                importPath = './' + importPath

                content = content.replace(new RegExp(key, 'g'), importPath)
            }

            await fs.promises.writeFile(file, content)
        }

        // resources
        const resources = await fs.promises.readdir(resolve(import.meta.dirname, 'src/templates'))

        for (const r of resources) {
            await fs.promises.cp(
                resolve(import.meta.dirname, 'src/templates', r),
                resolve(import.meta.dirname, 'dist/templates', r)
            )
        }
    },
})
