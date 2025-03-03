import { inject } from '@files/modules/context/index.js'
import { defineCommand } from '../defineCommand.js'
import type { Command } from '@files/modules/commander/types.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default defineCommand({
    name: 'help',
    async execute() {
        const commands = inject<Command[]>('commander:commands')
        const plugins = inject<Command[]>('commander:plugins')
        const binName = inject<string>('commander:binName') || 'node index.js'
        const [name] = inject<string[]>('commander:args')

        const command = commands.find((command) => command.name === name)

        const ui = require('cliui')({})

        if (command) {
            ui.div({
                text: `Usage: ${binName} ${command.name} [ARGS] [ARG...]`,
                padding: [1, 0, 1, 0],
            })

            if (command.args) {
                ui.div('Arguments:')

                Object.entries(command.args).forEach(([name, arg]) => {
                    ui.div(
                        {
                            text: `${name}:`,
                            width: 20,
                            padding: [0, 4, 0, 4],
                        },
                        {
                            text: arg.description || '',
                            padding: [0, 0, 0, 0],
                        }
                    )
                })
            }

            console.log(ui.toString())
            return
        }

        ui.div({
            text: `Usage: ${binName} [COMMAND] [OPTIONS]`,
            padding: [1, 0, 1, 0],
        })

        ui.div('Commands:')

        const uncategorized = commands
            .filter((command) => !command.categories?.length)
            .toSorted((a, b) => a.name.localeCompare(b.name))

        for (const command of uncategorized) {
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

        const categories = commands
            .filter((command) => command.categories?.length)
            .map((command) => command.categories)
            .flat()
            .filter((value, index, self) => self.indexOf(value) === index)

        for (const category of categories) {
            const categoryCommands = commands
                .filter((c) => c.categories?.includes(category))
                .toSorted((a, b) => a.name.localeCompare(b.name))

            ui.div({
                text: category,
                padding: [1, 0, 1, 0],
            })

            for (const command of categoryCommands) {
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
        }

        if (plugins.length) {
            ui.div({
                text: 'Plugins:',
                padding: [1, 0, 1, 0],
            })

            for (const plugin of plugins) {
                ui.div(
                    {
                        text: plugin.name,
                        width: 30,
                        padding: [0, 4, 0, 4],
                    },
                    {
                        text: plugin.description || '',
                        padding: [0, 0, 0, 0],
                    }
                )
            }
        }

        console.log(ui.toString())
    },
})
