import os from 'os'
import { defineCommand } from '@/core/commander/defineCommand.js'
import { filesystem, parsers, transforms } from '@/filesystem.js'
import { input, select } from '@inquirer/prompts'

export default defineCommand({
    name: 'create',
    description: 'Create new sources',
    execute: async () => {
        const resolve = filesystem.path.resolve
        const filename = resolve(os.homedir(), '.sidekick-coder-lab', 'config.json')

        const payload = {
            name: '',
            type: '',
            confg: {} as any,
        }

        const name = await input({ message: 'Enter the source name' })

        const type = await select({
            message: 'Select the source type',
            choices: [
                { name: 'Local', value: 'local' },
                { name: 'Github', value: 'github' },
            ],
        })

        payload.name = name
        payload.type = type

        if (payload.type === 'github') {
            const username = await input({ message: 'Enter the username' })
            const repository = await input({ message: 'Enter the repository name' })

            payload.confg = {
                username,
                repository,
            }
        }

        if (payload.type === 'local') {
            const path = await input({ message: 'Enter the path' })

            payload.confg = {
                path,
            }
        }

        let config = {
            sources: [],
        }

        if (filesystem.existsSync(filename)) {
            config = filesystem.readSync(filename, {
                transform: transforms.json,
            })
        }

        const sources = config.sources || []

        sources.push(payload)

        config.sources = sources

        filesystem.writeSync(filename, parsers.json(config), {
            recursive: true,
        })

        console.log('New source created:')

        console.log(payload)
    },
})
