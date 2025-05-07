import { defineCommand } from '@/core/commander/defineCommand.js'
import { input, select } from '@inquirer/prompts'
import config from '@/config.js'

export default defineCommand({
    name: 'create',
    description: 'Create new sources',
    execute: async () => {
        const payload = {
            name: '',
            type: '',
            config: {} as any,
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

            payload.config = {
                username,
                repository,
            }
        }

        if (payload.type === 'local') {
            const path = await input({ message: 'Enter the path' })

            payload.config = {
                path,
            }
        }

        const sources = config.sources || []

        sources.push(payload)

        config.sources = sources

        console.log('New source created:')

        console.log(payload)
    },
})
