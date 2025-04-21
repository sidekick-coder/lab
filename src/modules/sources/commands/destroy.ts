import os from 'os'
import { defineCommand } from '@/core/commander/defineCommand.js'
import { filesystem, parsers, transforms } from '@/filesystem.js'
import { select } from '@inquirer/prompts'

export default defineCommand({
    name: 'destroy',
    description: 'Delete a sources',
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

        const sources = config.sources || []

        if (sources.length === 0) {
            console.log('No sources found.')
            return
        }

        const selected = await select({
            message: 'Select the source to delete',
            choices: sources.map((source: any) => ({
                name: source.name,
                value: source.name,
            })),
        })

        console.log(`Deleting source: ${selected}`)

        const newSources = sources.filter((source: any) => source.name !== selected)

        config.sources = newSources

        filesystem.writeSync(filename, parsers.json(config), {
            recursive: true,
        })
    },
})
