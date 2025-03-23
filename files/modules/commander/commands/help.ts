import { inject } from '@files/modules/context/index.js'
import { defineCommand } from '../defineCommand.js'
import type { Command, Plugin, CommanderConfig, Manifest } from '@files/modules/commander/types.js'
import { createRequire } from 'module'
import { useFilesystem } from '@files/modules/filesystem/injections.js'

const require = createRequire(import.meta.url)

export default defineCommand({
    name: 'help',
    description: 'Display help information',
    async execute() {
        const filesystem = useFilesystem()
        const options = inject<CommanderConfig>('commander:options')
        const [name] = inject<string[]>('commander:args')

        const manifest = filesystem.readSync.json(options.manifest) as Manifest
        const binName = options.binName

        if (!manifest) {
            console.log('No manifest found')
            return
        }

        const commands = manifest.commands as Command[]
        const plugins = manifest.plugins as Plugin[]

        const ui = require('cliui')({})

        const command = manifest.commands.find((c) => c.name === name)

        if (command) {
            ui.div({
                text: `Usage: ${binName} ${command.name} [ARGS] [ARG...]`,
                padding: [1, 0, 1, 0],
            })

            if (command.args) {
                ui.div('Arguments:')

                Object.entries<any>(command.args).forEach(([name, arg]) => {
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
                    width: 50,
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
                        width: 50,
                        padding: [0, 4, 0, 4],
                    },
                    {
                        text: command.description || '',
                        padding: [0, 0, 0, 0],
                    }
                )
            }
        }

        // execute plugins
        for (const p of plugins) {
            if (p.type === 'execute' && p.manifest) {
                ui.div({
                    text: `[Plugin]: ${p.name}`,
                    padding: [1, 0, 1, 0],
                })

                const pluginCommands = p.manifest?.commands || []

                for (const c of pluginCommands) {
                    ui.div(
                        {
                            text: `${binName} -p ${p.name} ${c.name}`,
                            width: 50,
                            padding: [0, 4, 0, 4],
                        },
                        {
                            text: c.description || '',
                            padding: [0, 0, 0, 0],
                        }
                    )
                }
            }
        }

        console.log(ui.toString())
    },
})
