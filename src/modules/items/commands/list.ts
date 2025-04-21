import os from 'os'
import { defineCommand } from '@/core/commander/defineCommand.js'
import { filesystem, transforms } from '@/filesystem.js'

export default defineCommand({
    name: 'list',
    description: 'List all available items',
    options: {
        source: {
            type: 'flag',
        },
    },
    execute: async ({ options }) => {
        const resolve = filesystem.path.resolve
        const filename = resolve(os.homedir(), '.sidekick-coder-lab', 'config.json')

        if (!filesystem.existsSync(filename)) {
            console.log('No sources found.')
            return
        }

        const config = filesystem.readSync(filename, {
            transform: transforms.json,
        })

        const sources = config.sources || []

        const source = sources.find((source: any) => source.name === options.source)

        if (!source) {
            console.log(`Source ${options.source} not found.`)
            return
        }

        if (source.type === 'local') {
            const manifest = filesystem.readSync(source.config.path, {
                transform: transforms.json,
            })

            manifest.items.forEach((item: any) => {
                console.log(item.name)
            })

            return
        }
    },
})
