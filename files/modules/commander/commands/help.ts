import { inject } from '@files/modules/context/index.js'
import { defineCommand } from '../defineCommand.js'
import type { Command } from '@files/modules/commander/types.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default defineCommand({
    name: 'help',
    async execute() {
        const commands = inject<Command[]>('commands')

        const ui = require('cliui')({})

        ui.div('Usage: lab [command] [options]')

        ui.div('Commands:')

        for (const command of commands) {
            ui.div(
                {
                    text: command.name,
                    width: 30,
                    padding: [0, 4, 0, 4],
                },
                {
                    text: command.description || '',
                    padding: [0, 0, 0, 0],
                }
            )
        }

        console.log(ui.toString())
    },
})
