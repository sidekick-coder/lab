import type { Config } from '@/types.js'
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
    name: 'add:util',
    description: 'Add a new utility command',
    execute() {
        const { name } = useArgs(args)
        const { force } = useFlags(flags)

        const config = inject<Config>('config')
        const filesystem = createFilesystem()
        const resolve = filesystem.path.resolve
        const utilsDir = resolve(import.meta.dirname, '../../files/utils')

        let source = resolve(utilsDir, camelCase(name))
        let target = resolve(config.baseDir, 'utils', camelCase(name))

        const isFolder = filesystem.existsSync(source)

        if (!isFolder) {
            source += '.ts'
            target += '.ts'
        }

        const isFile = filesystem.existsSync(source)

        if (!isFile) {
            throw new Error(`util ${name} not found`)
        }

        if (filesystem.existsSync(target) && !force) {
            console.log(`Utility command ${name} already exists`)
            return
        }

        filesystem.copySync(source, target)

        console.log(`Added ${name} utility command`)
    },
})
