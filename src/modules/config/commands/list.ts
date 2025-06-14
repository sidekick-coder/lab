import { defineCommand } from '@/core/commander/defineCommand.js'
import ConfigRepository from '../ConfigRepository.js'
import { object } from '@/core/cli-ui/object.js'

export default defineCommand({
    name: 'list',
    description: 'Show lab config paths',
    async execute() {
        const repository = new ConfigRepository()

        const configs = await repository.list()

        configs.forEach((c) => object(c))
    },
})
