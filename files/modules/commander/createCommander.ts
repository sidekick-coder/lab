import { createRequire } from 'module'

import type { Command, CommanderConfig, Plugin } from './types.js'
import { validate } from '@files/modules/validator/index.js'
import { schema as sources } from '@files/modules/sources/index.js'
import { createFilesystem } from '../filesystem/createFilesystem.js'
import { tryCatch } from '@files/utils/tryCatch.js'
import * as ctx from '@files/modules/context/index.js'
import minimist from 'minimist'

const require = createRequire(import.meta.url)

interface AddOptions {
    prefix?: string
}

export type Commander = ReturnType<typeof createCommander>

export function createCommander(payload: Partial<CommanderConfig> = {}) {
    const commands: Command[] = []
    const plugins: Plugin[] = []
    const filesystem = createFilesystem()
    const resolve = filesystem.path.resolve
    const binName = payload.binName

    const options = validate(payload, (v) =>
        v.object({
            binName: v.optional(v.string(), 'node index.js'),
            sources: v.optional(sources()),
            manifest: v.optional(v.string(), resolve(process.cwd(), 'manifest.json')),
        })
    )

    function add(command: Command, options: AddOptions = {}) {
        let name = command.name

        if (options.prefix) {
            name = `${options.prefix}${name}`
        }

        const exists = commands.some((command) => command.name === name)

        if (exists) {
            return
        }

        commands.push({
            ...command,
            name: name,
        })
    }

    function addFile(file: string, options: AddOptions = {}) {
        const fileModule = require(file)
        const command = fileModule.default
        const argsDefinition = fileModule.args

        if (!command) return

        if (!command.name) {
            command.name = filesystem.path.basename(file)
        }

        if (argsDefinition) {
            command.args = argsDefinition
        }

        add(command, options)
    }

    function addDir(dir: string, options: AddOptions = {}) {
        filesystem.readdirSync(dir).forEach((f) => addFile(resolve(dir, f), options))
    }

    async function run(name: string) {
        const command = commands.find((command) => command.name === name)

        if (!command) {
            throw new Error(`Command not found: ${name}`)
        }

        return await command.execute()
    }

    async function runPlugin(name: string, args: string[]) {
        const plugin = plugins.find((plugin) => plugin.name === name)

        if (!plugin) {
            throw new Error(`Plugin not found: ${name}`)
        }

        if (plugin.type !== 'execute') {
            throw new Error(`Plugin type not execlute`)
        }

        return await plugin.execute(args)
    }

    async function handle(args: string[]) {
        const { _, plugin, ...rest } = minimist(args, { alias: { p: 'plugin' } })

        let newArgs = _

        Object.entries(rest)
            .filter(([key]) => key !== 'p')
            .map(([key, value]) => {
                if (!Array.isArray(value)) {
                    return [[key, value]]
                }

                return value.map((v) => [key, v])
            })
            .flat()
            .forEach(([key, value]) => {
                newArgs = newArgs.concat(`--${key}`, String(value))
            })

        if (plugin) {
            return runPlugin(plugin, newArgs)
        }

        let [name] = _

        const exists = commands.some((command) => command.name === name)

        if (!exists) {
            name = 'help'
        }

        ctx.open()

        ctx.provide('commander:commands', commands)
        ctx.provide('commander:plugins', plugins)
        ctx.provide('commander:args', newArgs.slice(1))
        ctx.provide('commander:binName', binName)
        ctx.provide('commander:options', options)

        const [response, error] = await tryCatch(() => run(name))

        ctx.close()

        if (error) {
            throw error
        }

        return response
    }

    function addPlugin(plugin: Plugin) {
        plugins.push(plugin)

        if (plugin.type === 'command-list') {
            plugin.commands.forEach((c) =>
                add(c, {
                    prefix: plugin.prefix,
                })
            )
        }
    }

    // commander commands
    addDir(resolve(import.meta.dirname, 'commands'))

    options.sources.forEach((s) => addFile(s))

    return {
        commands,
        add,
        addFile,
        addDir,
        addPlugin,
        run,
        handle,
    }
}
