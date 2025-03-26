import { createRequire } from 'module'

import type { Command, Plugin } from './types.js'
import { validate } from '@files/modules/validator/index.js'
import { tryCatch } from '@files/utils/tryCatch.js'
import * as ctx from '@files/modules/context/index.js'
import minimist from 'minimist'
import type { Config } from './schemas.js'
import { config } from './schemas.js'

const require = createRequire(import.meta.url)

export type Commander = ReturnType<typeof createCommander>

export function createCommander(payload: Partial<Config> = {}) {
    const commands: Command[] = []
    const plugins: Plugin[] = []
    const options = validate(payload, config)
    const subCommanders = new Map<string, Commander>()

    function add(command: Command) {
        const name = command.name

        const exists = commands.some((command) => command.name === name)

        if (exists) {
            return
        }

        commands.push({
            ...command,
            name: name,
        })
    }

    function addFile(file: string) {
        const fileModule = require(file)
        const command = fileModule.default

        add(command)
    }

    function addSubCommander(name: string, commander: Commander) {
        subCommanders.set(name, commander)
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
        const [first] = args

        const subCommander = subCommanders.get(first)

        if (subCommander) {
            return subCommander.handle(args.slice(1))
        }

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
            name = options.defaultCommand
        }

        ctx.open()

        ctx.provide('commander:commands', commands)
        ctx.provide('commander:plugins', plugins)
        ctx.provide('commander:args', newArgs.slice(1))
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
            plugin.commands.forEach((c) => add(c))
        }
    }

    return {
        commands,
        add,
        addFile,
        addPlugin,
        addSubCommander,
        run,
        handle,
    }
}
