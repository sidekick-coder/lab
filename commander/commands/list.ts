import { defineCommand } from '../defineCommand.ts'

export default defineCommand({
    name: 'commander:list',
    async execute({ context, colors }) {
        if (!Array.isArray(context.commands)) {
            console.log('No commands found')
            return
        }

        for (const command of context.commands) {
            console.log(`- ` + colors.red(command))
        }
    },
})
