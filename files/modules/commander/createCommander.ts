import type { Command, Config } from './types.js'
import { createRequire } from 'module'
import { parse } from './options.js'

const require = createRequire(import.meta.url)

export interface Commander extends ReturnType<typeof createCommander> {}

export function createCommander(config: Config = {}) {
    const commands: Command[] = []
    const subCommanders = new Map<string, Commander>()

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

        const ctx = {
            args: args.split(' '),
            options: parse(command.options || {}, args),
        }

        if (config.before) {
            config.before({ command, ctx })
        }

        const result = await command.execute(ctx)

        if (config.after) {
            config.after({ command, ctx })
        }

        return result
    }

    async function handle(args: string[]) {
        const [name, ...rest] = args

        const subCommander = subCommanders.get(name)

        if (subCommander) {
            return subCommander.handle(rest)
        }

        const exists = commands.some((command) => command.name === name)

        if (!exists) {
            throw new Error(`Command not found: ${name}`)
        }

        return run(name, rest.join(' '))
    }

    return {
        commands,
        config,

        add,
        addFile,
        addSubCommander,
        addToSubCommander,
        getSubcommaners,
        run,
        handle,
    }
}
