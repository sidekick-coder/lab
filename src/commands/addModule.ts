import path from 'path'
import type { Config } from '@/types.js'
import { copyFile } from '@/utils/copyFile.js'
import { defineArgs, useArgs } from '@files/modules/commander/args.js'
import { defineCommand } from '@files/modules/commander/defineCommand.js'
import { defineFlags, useFlags } from '@files/modules/commander/flags.js'
import { inject } from '@files/modules/context/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import { camelCase } from 'lodash-es'

export const args = defineArgs({
    name: {
        description: 'The name of the utility command',
    },
})

export const flags = defineFlags({
    force: {
        description: 'Force the creation of the utility command',
    },
})

export default defineCommand({
    name: 'add:module',
    description: 'Add a module command',
    execute() {
        const { name } = useArgs(args)
        const { force } = useFlags(flags)

        const config = inject<Config>('config')
        const filesystem = createFilesystem()
        const resolve = filesystem.path.resolve
        const relative = filesystem.path.relative
        const modulesDir = resolve(import.meta.dirname, '../../files/modules')

        const moduleName = camelCase(name)

        const source = resolve(modulesDir, moduleName)
        const target = resolve(config.baseDir, 'modules', moduleName)

        if (filesystem.existsSync(target) && !force) {
            console.log(`Module ${name} already exists, use --force to overwrite`)
            return
        }

        const files = filesystem.globSync(resolve(source, '**', '*'))

        for (const file of files) {
            const relativeName = path.relative(source, file)

            const src = resolve(source, relativeName)
            const trg = resolve(target, relativeName)

            copyFile(src, trg, config)

            console.log(`File ${relative(target, trg)} added`)
        }

        console.log(`Module ${name} added`)
    },
})
