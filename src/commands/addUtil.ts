import type { Config } from '@/types.js'
import { copyFile } from '@/utils/copyFile.js'
import { defineCommand } from '@files/modules/commander/defineCommand.js'
import { inject } from '@files/modules/context/index.js'
import { createFilesystem } from '@files/modules/filesystem/createFilesystem.js'
import { camelCase } from 'lodash-es'

export default defineCommand({
    name: 'add:util',
    description: 'Add a new utility command',
    options: {
        name: {
            type: 'arg',
            description: 'The name of the utility command to add',
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
        const filesystem = createFilesystem()
        const resolve = filesystem.path.resolve
        const utilsDir = resolve(import.meta.dirname, '../../files/utils')

        const utilName = camelCase(name) + '.ts'

        const source = resolve(utilsDir, utilName)
        const target = resolve(config.baseDir, 'utils', utilName)

        if (filesystem.existsSync(target) && !force) {
            console.log(`Utility command ${name} already exists`)
            return
        }

        copyFile(source, target)

        console.log(`Added ${name} utility command`)
    },
})
