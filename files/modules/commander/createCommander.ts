import { createRequire } from 'module'

import type { Command, Plugin } from './types.js'
import { validate } from '@files/modules/validator/index.js'
import { tryCatch } from '@files/utils/tryCatch.js'
import * as ctx from '@files/modules/di/index.js'
import minimist from 'minimist'
import type { Config } from './schemas.js'
import { config } from './schemas.js'
import { createEmitter } from '@files/modules/emitter/index.js'
import { parse } from './options.js'

const require = createRequire(import.meta.url)

export interface Commander extends ReturnType<typeof createCommander> {}

export function createCommander(payload: Partial<Config> = {}) {
    const commands: Command[] = []
    const plugins: Plugin[] = []
    const options = validate(payload, config)
    const subCommanders = new Map<string, Commander>()
    const emitter = createEmitter()

    function add(...args: Command[]) {
        for (const command of args) {
            const name = command.name

            const exists = commands.some((command) => command.name === name)

            if (command.commander) {
                const subCommander = subCommanders.get(command.commander)

                if (!subCommander) {
                    throw new Error(`Sub commander not found: ${command.commander}`)
                }

                subCommander.add(command)

                continue
            }

            if (exists) {
                return
            }

            commands.push({
                ...command,
                name: name,
            })
        }
    }

    function addFile(file: string) {
        const fileModule = require(file)
        const command = fileModule.default

        return add(command)
    }

    function getSubcommaners() {
        return subCommanders
    }

    function addSubCommander(name: string, commander: Commander) {
        subCommanders.set(name, commander)
    }

    function addToSubCommander(name: string, command: Command) {
        const subCommander = subCommanders.get(name)

        if (!subCommander) {
            throw new Error(`Sub commander not found: ${name}`)
        }

        subCommander.add(command)
    }

    async function run(name: string, args = '') {
        const command = commands.find((command) => command.name === name)

        if (!command) {
            throw new Error(`Command not found: ${name}`)
        }

        emitter.emit('command:before', { command, plugins, options })

        const commandCtx = {
            options: parse(command.options || {}, args),
        }

        const result = await command.execute(commandCtx)

        emitter.emit('command:after', { command, plugins, options })

        return result
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

        const [first] = _

        const subCommander = subCommanders.get(first)

        if (subCommander) {
            const subArgs = args.slice()
            const index = subArgs.indexOf(first)

            subArgs.splice(index, 1) // remove the sub commander name from args

            return subCommander.handle(subArgs)
        }

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

        const commandArgs = newArgs.slice(1)

        ctx.provide('commander:commands', commands)
        ctx.provide('commander:plugins', plugins)
        ctx.provide('commander:args', commandArgs)
        ctx.provide('commander:options', options)

        const [response, error] = await tryCatch(() => run(name, commandArgs.join(' ')))

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
        emitter,
        options,

        add,
        addFile,
        addPlugin,
        addSubCommander,
        addToSubCommander,
        getSubcommaners,
        run,
        handle,
    }
}
