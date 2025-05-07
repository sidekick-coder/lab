import os from 'os'
import { defineCommand } from '@/core/commander/defineCommand.js'
import { filesystem, transforms } from '@/filesystem.js'
import { ui } from '@/core/cli-ui/ui.js'

export default defineCommand({
    name: 'list',
    description: 'List all available sources',
    execute: async () => {
        const resolve = filesystem.path.resolve
        const filename = resolve(os.homedir(), '.sidekick-coder-lab', 'config.json')

        if (!filesystem.existsSync(filename)) {
            console.log('No sources found.')
            return
        }

        const config = filesystem.readSync(filename, {
            transform: transforms.json,
        })

        console.log('Available sources:')

        const sources = config.sources || []

        if (sources.length === 0) {
            console.log('No sources found.')
            return
        }

        ui.array(sources)
    },
})
