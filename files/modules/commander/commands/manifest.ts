import { inject } from '@files/modules/context/index.js'
import { defineCommand } from '../defineCommand.js'
import type { CommanderConfig, Command, Plugin } from '@files/modules/commander/types.js'
import { useFilesystem } from '@files/modules/filesystem/injections.js'

export default defineCommand({
    name: 'manifest',
    description: 'Generate a manifest file',
    async execute() {
        const filesystem = useFilesystem()
        const resolve = filesystem.path.resolve

        const commands = inject<Command[]>('commander:commands')
        const plugins = inject<Plugin[]>('commander:plugins')
        const options = inject<CommanderConfig>('commander:options')

        const filename = options.manifest || resolve(process.cwd(), 'manifest.json')

        const json = {
            name: options.binName,
            commands: [],
            plugins: [],
        }

        for (const command of commands) {
            json.commands.push({
                name: command.name,
                description: command.description,
                args: command.args,
                categories: command.categories,
            })
        }

        for (const p of plugins) {
            if (p.type === 'execute' && p.manifest) {
                const manifest = filesystem.readSync.json(p.manifest)

                json.plugins.push({
                    name: p.name,
                    type: p.type,
                    manifest,
                })
            }
        }

        filesystem.writeSync.json(filename, json)
    },
})
