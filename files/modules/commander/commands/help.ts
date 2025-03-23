import { inject } from '@files/modules/context/index.js'
import { defineCommand } from '../defineCommand.js'
import type { Command, Plugin, CommanderConfig, Manifest } from '@files/modules/commander/types.js'
import { createRequire } from 'module'
import { useFilesystem } from '@files/modules/filesystem/injections.js'
import chalk from 'chalk'

const require = createRequire(import.meta.url)

export default defineCommand({
    name: 'help',
    description: 'Display help information',
    async execute() {
        const filesystem = useFilesystem()
        const options = inject<CommanderConfig>('commander:options')
        const [name] = inject<string[]>('commander:args')
        const ui = require('cliui')({})

        const manifest = filesystem.readSync.json(options.manifest) as Manifest
        const binName = options.binName

        if (!manifest) {
            console.log('No manifest found')
            return
        }

        const commands = manifest.commands as Command[]
        const plugins = manifest.plugins as Plugin[]

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
        })

        ui.div({
            text: `Mode: ${process.env.NODE_ENV === 'development' ? 'development' : 'production'}`,
            //padding: [0, 0, 0, 0],
        })

        const sections = [] as { title: string; prefix?: string; commands: Command[] }[]

        const uncategorized = commands
            .filter((command) => !command.categories?.length)
            .toSorted((a, b) => a.name.localeCompare(b.name))

        sections.push({ title: 'Commands', commands: uncategorized })

        const categories = commands
            .filter((command) => command.categories?.length)
            .map((command) => command.categories)
            .flat()
            .filter((value, index, self) => self.indexOf(value) === index)

        for (const category of categories) {
            const categoryCommands = commands
                .filter((c) => c.categories?.includes(category))
                .toSorted((a, b) => a.name.localeCompare(b.name))

            sections.push({
                title: category,
                commands: categoryCommands,
            })
        }

        // execute plugins
        for (const p of plugins) {
            if (p.type === 'execute' && p.manifest) {
                const pluginCommands: Command[] = p.manifest?.commands || []

                const pluginUncategorized = pluginCommands.filter((c) => !c.categories?.length)
                const categories = pluginCommands
                    .filter((c) => c.categories?.length)
                    .map((c) => c.categories)
                    .flat()
                    .filter((value, index, self) => self.indexOf(value) === index)

                const prefix = `${binName} -p ${p.name} `

                sections.push({
                    title: `[${p.name}] Commands`,
                    commands: pluginUncategorized,
                    prefix,
                })

                for (const category of categories) {
                    const categoryCommands = pluginCommands.filter((c) =>
                        c.categories?.includes(category)
                    )

                    sections.push({
                        title: `[${p.name}] ${category}`,
                        commands: categoryCommands,
                        prefix,
                    })
                }
            }
        }

        for (const s of sections) {
            ui.div({
                text: chalk.cyan(s.title),
                padding: [1, 0, 0, 0],
            })

            for (const command of s.commands) {
                ui.div(
                    {
                        text: `${s.prefix || ''}${command.name}`,
                        width: 50,
                        padding: [0, 2, 0, 2],
                    },
                    {
                        text: command.description || '',
                        padding: [0, 0, 0, 0],
                    }
                )
            }
        }

        console.log(ui.toString())
    },
})
