import path from 'path'
import type { Config } from '@/types.js'
import { copyFile } from '@/utils/copyFile.js'
import { defineCommand } from '@files/modules/commander/defineCommand.js'
import { inject } from '@files/modules/context/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import { camelCase } from 'lodash-es'

export default defineCommand({
    name: 'add:module',
    description: 'Add a module command',
    options: {
        name: {
            type: 'arg',
            description: 'The name of the module to add',
        },
        force: {
            type: 'flag',
            alias: ['f'],
            description: 'Force the creation of the utility command',
            transform: (value) => value === 'true' || value === '1' || value === 'yes',
        },
    },
    execute({ options }) {
        const { name, force } = options

        const config = inject<Config>('config')
        const fs = createFilesystem()

        const resolve = fs.path.resolve
        const relative = fs.path.relative

        const modulesDir = resolve(import.meta.dirname, '../../files/modules')

        const moduleName = camelCase(name)

        const source = resolve(modulesDir, moduleName)
        const target = resolve(config.baseDir, 'modules', moduleName)

        if (fs.existsSync(target) && !force) {
            console.log(`Module ${name} already exists, use --force to overwrite`)
            return
        }

        const files = fs.globSync(resolve(source, '**', '*'))

        for (const file of files) {
            const relativeName = path.relative(source, file)

            const src = resolve(source, relativeName)
            const trg = resolve(target, relativeName)

            copyFile(src, trg)

            console.log(`File ${relative(target, trg)} added`)
        }

        console.log(`Module ${name} added`)
    },
})
